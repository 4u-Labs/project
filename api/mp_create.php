<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$user = verifyAuthToken();
$uid = (int)$user['id'];
$email = $user['email'] ?? '';

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$packageIndex = (int)($body['package_index'] ?? 1);
$packages = CREDIT_PACKAGES;

if (!isset($packages[$packageIndex])) {
    jsonError('Pacote inválido.');
}

$package   = $packages[$packageIndex];
$amountBRL = $package['price_cents'] / 100;
$credits   = $package['credits'];
$label     = $package['label'];

$mpPayload = [
    'transaction_amount' => $amountBRL,
    'description'        => "ProjectClone IA — {$label}",
    'payment_method_id'  => 'pix',
    'external_reference' => (string)$uid,
    'notification_url'   => 'https://4u.ia.br/app/office/keepai/api/mp_webhook.php',
    'payer' => [
        'email'          => $email ?: 'usuario@4u.ia.br',
        'first_name'     => $user['display_name'] ?: 'Usuário',
        'last_name'      => 'ProjectClone 4U',
        'identification' => ['type' => 'CPF', 'number' => '00000000000'],
    ],
    'metadata' => [
        'credits'       => $credits,
        'user_id'       => $uid,
        'package_label' => $label,
    ],
];

$ch = curl_init('https://api.mercadopago.com/v1/payments');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($mpPayload),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . MP_ACCESS_TOKEN,
        'X-Idempotency-Key: proj-' . $uid . '-' . time() . '-' . rand(100, 999),
    ],
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 201) {
    $err = json_decode((string)$response, true);
    jsonError('Erro ao gerar PIX: ' . ($err['message'] ?? 'Tente novamente.'), 502);
}

$mpData     = json_decode((string)$response, true);
$paymentId  = $mpData['id'];
$pixQrCode  = $mpData['point_of_interaction']['transaction_data']['qr_code'] ?? '';
$pixQrB64   = $mpData['point_of_interaction']['transaction_data']['qr_code_base64'] ?? '';
$expiresAt  = $mpData['date_of_expiration'] ?? '';

// Grava transação pendente no SQLite compartilhado
$pdo = Database::get();
$pdo->prepare('
    INSERT OR IGNORE INTO transactions (user_id, mp_payment_id, package_label, amount_brl, credits_added, status)
    VALUES (?, ?, ?, ?, ?, "pending")
')->execute([$uid, (string)$paymentId, $label, $amountBRL, $credits]);

jsonResponse([
    'success'        => true,
    'payment_id'     => $paymentId,
    'qr_code'        => $pixQrCode,
    'qr_code_base64' => $pixQrB64,
    'amount_brl'     => $amountBRL,
    'credits'        => $credits,
    'label'          => $label,
    'expires_at'     => $expiresAt,
]);
