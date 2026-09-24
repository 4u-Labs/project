<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$user = verifyAuthToken();
$uid = (int)$user['id'];

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$orderId = trim($body['order_id'] ?? '');

if (empty($orderId)) {
    jsonError('Order ID required.');
}

// 1. Get PayPal OAuth2 Token
$ch = curl_init(PAYPAL_API_BASE . '/v1/oauth2/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_USERPWD => PAYPAL_CLIENT_ID . ':' . PAYPAL_SECRET,
    CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Accept-Language: en_US',
    ],
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$tokenResponse = curl_exec($ch);
$tokenHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($tokenHttpCode !== 200) {
    jsonError('Failed to authenticate with PayPal.', 502);
}

$tokenData = json_decode((string)$tokenResponse, true);
$accessToken = $tokenData['access_token'] ?? '';

if (empty($accessToken)) {
    jsonError('PayPal access token missing.', 502);
}

// 2. Capture the order
$ch = curl_init(PAYPAL_API_BASE . "/v2/checkout/orders/{$orderId}/capture");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken,
        'PayPal-Request-Id: capture-' . $orderId . '-' . time(),
    ],
    CURLOPT_TIMEOUT => 25,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$captureResponse = curl_exec($ch);
$captureHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($captureHttpCode !== 201 && $captureHttpCode !== 200) {
    $err = json_decode((string)$captureResponse, true);
    jsonError('Failed to capture PayPal payment: ' . ($err['message'] ?? 'Please try again.'), 502);
}

$captureData = json_decode((string)$captureResponse, true);
$status = $captureData['status'] ?? '';

if ($status !== 'COMPLETED') {
    jsonError('Payment not completed. Status: ' . $status, 400);
}

// Check purchase units and custom_id
$purchaseUnit = $captureData['purchase_units'][0] ?? [];
$customId = $purchaseUnit['payments']['captures'][0]['custom_id'] ?? ($purchaseUnit['custom_id'] ?? '');

$creditsToAdd = 0;
if (!empty($customId)) {
    $parts = explode(':', $customId);
    if (count($parts) >= 3) {
        $creditsToAdd = (int) $parts[2];
    }
}

$pdo = Database::get();

// Idempotency check: check if already approved
$checkStmt = $pdo->prepare('SELECT status, credits_added FROM transactions WHERE mp_payment_id = ?');
$checkStmt->execute(['PAYPAL-' . $orderId]);
$existing = $checkStmt->fetch();

if ($existing && $existing['status'] === 'approved') {
    $uStmt = $pdo->prepare('SELECT credits FROM users WHERE id = ?');
    $uStmt->execute([$uid]);
    $uRow = $uStmt->fetch();

    jsonResponse([
        'success' => true,
        'already_processed' => true,
        'credits_added' => (int) $existing['credits_added'],
        'new_credits' => (int) ($uRow['credits'] ?? 0),
    ]);
}

if ($creditsToAdd <= 0 && $existing) {
    $creditsToAdd = (int) $existing['credits_added'];
}

if ($creditsToAdd <= 0) {
    $creditsToAdd = 10;
}

// Add credits to user in SQLite
$pdo->prepare('UPDATE users SET credits = credits + ?, updated_at = datetime("now") WHERE id = ?')
    ->execute([$creditsToAdd, $uid]);

// Update transaction
if ($existing) {
    $pdo->prepare('UPDATE transactions SET status = "approved", credits_added = ? WHERE mp_payment_id = ?')
        ->execute([$creditsToAdd, 'PAYPAL-' . $orderId]);
} else {
    $amountUSD = (float) ($purchaseUnit['payments']['captures'][0]['amount']['value'] ?? 0);
    $pdo->prepare('
        INSERT INTO transactions (user_id, mp_payment_id, package_label, amount_brl, credits_added, status)
        VALUES (?, ?, ?, ?, ?, "approved")
    ')->execute([$uid, 'PAYPAL-' . $orderId, "PayPal ({$creditsToAdd} credits)", $amountUSD, $creditsToAdd]);
}

// Get updated credits
$uStmt = $pdo->prepare('SELECT credits FROM users WHERE id = ?');
$uStmt->execute([$uid]);
$uRow = $uStmt->fetch();
$newCredits = (int) ($uRow['credits'] ?? 0);

jsonResponse([
    'success' => true,
    'credits_added' => $creditsToAdd,
    'new_credits' => $newCredits,
]);
