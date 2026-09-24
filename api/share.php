<?php
/**
 * ProjectClone - API de Compartilhamento em Nuvem
 * Permite salvar snapshots de projetos e carregar via link único (somente leitura ou editável).
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Diretório de armazenamento de snapshots compartilhados
$sharesDir = __DIR__ . '/../data/shares';
if (!is_dir($sharesDir)) {
    @mkdir($sharesDir, 0775, true);
}

// Protege diretório com .htaccess se não existir
$htaccess = $sharesDir . '/.htaccess';
if (!file_exists($htaccess)) {
    @file_put_contents($htaccess, "Options -Indexes\nDeny from all\n");
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Função auxiliar para gerar ID curto seguro
function generateShortId($length = 8) {
    $chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    $id = '';
    $max = strlen($chars) - 1;
    for ($i = 0; $i < $length; $i++) {
        $id .= $chars[random_int(0, $max)];
    }
    return $id;
}

// 1. SALVAR / COMPARTILHAR PROJETO
if ($action === 'save' || $action === 'create') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método inválido. Use POST.']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    if (!$rawInput || strlen($rawInput) > 10 * 1024 * 1024) { // Limite de 10MB
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados inválidos ou tamanho excede 10MB.']);
        exit;
    }

    $data = json_decode($rawInput, true);
    if (!is_array($data) || empty($data['tasks'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Estrutura de dados de projeto inválida.']);
        exit;
    }

    // Gera ID único que ainda não exista
    do {
        $id = generateShortId(8);
        $filePath = $sharesDir . '/' . $id . '.json';
    } while (file_exists($filePath));

    $projectName = trim($data['project']['name'] ?? 'Projeto Sem Título');
    $isReadOnly = !empty($data['readOnly']);

    $sharePayload = [
        'id' => $id,
        'name' => $projectName,
        'createdAt' => date('c'),
        'readOnly' => $isReadOnly,
        'taskCount' => count($data['tasks']),
        'data' => $data
    ];

    $saved = @file_put_contents($filePath, json_encode($sharePayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    if ($saved === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Falha ao gravar arquivo em nuvem.']);
        exit;
    }

    // Monta URL pública
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? '4u.ia.br';
    $baseUri = rtrim(dirname(dirname($_SERVER['REQUEST_URI'] ?? '/app/project/')), '/\\');
    if (empty($baseUri) || $baseUri === '.') $baseUri = '/app/project';
    $shareUrl = "{$protocol}://{$host}{$baseUri}/?share={$id}";
    if ($isReadOnly) {
        $shareUrl .= "&ro=1";
    }

    echo json_encode([
        'success' => true,
        'id' => $id,
        'shareUrl' => $shareUrl,
        'readOnly' => $isReadOnly,
        'name' => $projectName,
        'taskCount' => count($data['tasks'])
    ]);
    exit;
}

// 2. RECUPERAR PROJETO COMPARTILHADO
if ($action === 'get') {
    $id = trim($_GET['id'] ?? '');
    // Validação estrita do ID (letras e números apenas)
    if (!preg_match('/^[a-zA-Z0-9_-]{4,32}$/', $id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID de compartilhamento inválido.']);
        exit;
    }

    $filePath = $sharesDir . '/' . $id . '.json';
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Projeto compartilhado não encontrado ou expirado.']);
        exit;
    }

    $content = @file_get_contents($filePath);
    if (!$content) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao carregar dados do projeto.']);
        exit;
    }

    $parsed = json_decode($content, true);
    if (!$parsed || empty($parsed['data'])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Arquivo corrompido.']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'id' => $parsed['id'] ?? $id,
        'name' => $parsed['name'] ?? 'Projeto Compartilhado',
        'createdAt' => $parsed['createdAt'] ?? '',
        'readOnly' => !empty($parsed['readOnly']),
        'data' => $parsed['data']
    ]);
    exit;
}

// Ação desconhecida
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação não informada ou inválida. Use ?action=save ou ?action=get']);
