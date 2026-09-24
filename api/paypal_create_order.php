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
$packages = CREDIT_PACKAGES_USD;

if (!isset($packages[$packageIndex])) {
    jsonError('Invalid package index.');
}

$package = $packages[$packageIndex];
$priceUSD = $package['price_usd'];
$credits = $package['credits'];
$label = $package['label'];

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

// 2. Create PayPal Order
$orderPayload = [
    'intent' => 'CAPTURE',
    'purchase_units' => [
        [
            'reference_id' => 'proj-' . $uid . '-' . time(),
            'description' => "ProjectClone IA — {$label} (AI Credits)",
            'custom_id' => "{$uid}:{$packageIndex}:{$credits}",
            'amount' => [
                'currency_code' => 'USD',
                'value' => $priceUSD,
            ],
        ],
    ],
    'application_context' => [
        'brand_name' => 'ProjectClone 4U',
        'landing_page' => 'NO_PREFERENCE',
        'user_action' => 'PAY_NOW',
    ],
];

$ch = curl_init(PAYPAL_API_BASE . '/v2/checkout/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($orderPayload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $accessToken,
        'PayPal-Request-Id: proj-' . $uid . '-' . time() . '-' . rand(100, 999),
    ],
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$orderResponse = curl_exec($ch);
$orderHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($orderHttpCode !== 201) {
    $err = json_decode((string)$orderResponse, true);
    jsonError('Failed to create PayPal order: ' . ($err['message'] ?? 'Please try again.'), 502);
}

$orderData = json_decode((string)$orderResponse, true);
$orderId = $orderData['id'] ?? '';

if (empty($orderId)) {
    jsonError('Invalid PayPal order response.', 502);
}

// 3. Save pending transaction in database
$pdo = Database::get();
$stmt = $pdo->prepare('
    INSERT INTO transactions (user_id, mp_payment_id, package_label, amount_brl, credits_added, status)
    VALUES (?, ?, ?, ?, ?, "pending")
');
$stmt->execute([
    $uid,
    'PAYPAL-' . $orderId,
    $label . ' ($' . $priceUSD . ' USD)',
    (float)$priceUSD,
    $credits
]);

jsonResponse([
    'success' => true,
    'order_id' => $orderId,
    'amount_usd' => $priceUSD,
    'credits' => $credits,
    'label' => $label,
]);
