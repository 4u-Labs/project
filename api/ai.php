<?php
/**
 * ProjectClone - Backend de Inteligência Artificial (OpenAI gpt-4o-mini)
 * 1. Gerador de Cronogramas por Prompt (Prompt-to-Gantt)
 * 2. Auditor de Riscos e Gargalos do Cronograma
 * 3. Gerador de Relatório de Status Executivo (WhatsApp & E-mail)
 * 4. Otimizador de Prazos (Fast-Tracking & Crashing)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (php_sapi_name() !== 'cli') {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido. Utilize POST.']);
        exit;
    }
}

if (php_sapi_name() !== 'cli' || basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['action'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Requisição inválida. Parâmetro "action" obrigatório.']);
        exit;
    }

    // Configuração da Chave da OpenAI (Carregamento seguro de .env ou chave do usuário)
    $serverKey = get_project_env_key();
    $apiKey = !empty($data['userApiKey']) ? trim($data['userApiKey']) : $serverKey;

    if (empty($apiKey)) {
        throw new Exception('Chave da OpenAI não configurada no servidor. Configure no arquivo .env ou informe sua chave.');
    }

    $action = $data['action'];

    try {
        switch ($action) {
            case 'generate':
                handleGenerateProject($data, $apiKey);
                break;

            case 'audit':
                handleAuditProject($data, $apiKey);
                break;

            case 'report':
                handleReportProject($data, $apiKey);
                break;

            case 'optimize':
                handleOptimizeProject($data, $apiKey);
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Ação desconhecida: ' . htmlspecialchars($action)]);
                break;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

/**
 * Função para carregar chave da OpenAI do ambiente ou arquivo .env local
 */
function get_project_env_key() {
    $cfgPath = __DIR__ . '/config.php';
    if (file_exists($cfgPath)) {
        require_once $cfgPath;
        if (defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)) return OPENAI_API_KEY;
    }
    $envPath = __DIR__ . '/../.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($name, $value) = explode('=', $line, 2);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                if (trim($name) === 'OPENAI_API_KEY') return $value;
            }
        }
    }
    $vpilotConfig = '/home/fabiano/public_html/app/voicepilot/api/config.php';
    if (file_exists($vpilotConfig)) {
        $cnt = file_get_contents($vpilotConfig);
        if (preg_match("/define\('OPENAI_API_KEY',\s*'([^']+)'\)/", $cnt, $m)) {
            return $m[1];
        }
    }
    return getenv('OPENAI_API_KEY') ?: '';
}

/**
 * Função para chamada cURL à API OpenAI
 */
function callOpenAiChat($apiKey, $systemPrompt, $userPrompt, $jsonMode = true, $temperature = 0.3) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $payload = [
        'model' => 'gpt-4o-mini',
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt]
        ],
        'temperature' => $temperature
    ];

    if ($jsonMode) {
        $payload['response_format'] = ['type' => 'json_object'];
    }

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new Exception('Erro de conexão com o motor de IA: ' . $err);
    }
    curl_close($ch);

    $result = json_decode($response, true);
    if (isset($result['error'])) {
        throw new Exception('OpenAI API Error: ' . ($result['error']['message'] ?? 'Desconhecido'));
    }

    $content = $result['choices'][0]['message']['content'] ?? '';
    return $content;
}

/**
 * 1. Gerador de Cronograma Completo por Prompt (Prompt-to-Gantt)
 */
function handleGenerateProject($data, $apiKey) {
    $prompt = trim($data['prompt'] ?? '');
    if (empty($prompt)) {
        throw new Exception('Por favor, informe a descrição do projeto.');
    }

    $startDate = !empty($data['startDate']) ? $data['startDate'] : date('Y-m-d');
    $currency = !empty($data['currency']) ? $data['currency'] : 'BRL';
    $startYear = (int)substr($startDate, 0, 4);
    $maxYear = $startYear + 2;

    $systemPrompt = "Você é um Especialista Sênior em Gerenciamento de Projetos e Engenharia de Cronogramas certificado PMP/PMI.
Sua missão é criar uma Estrutura Analítica do Projeto (EAP / WBS) completa, profissional e realista para o software ProjectClone (compatível com MS Project).

A data de início do projeto deve ser: {$startDate}.
Ano base do cronograma: {$startYear} (Todas as datas devem ficar estritamente entre {$startYear} e {$maxYear}).
A moeda é: {$currency}.

Você DEVE responder EXCLUSIVAMENTE em formato JSON rigoroso com a seguinte estrutura:
{
  \"project\": {
    \"name\": \"Nome claro e profissional do projeto\",
    \"startDate\": \"{$startDate}\",
    \"currency\": \"{$currency}\",
    \"showCriticalPath\": true,
    \"zoom\": \"week\"
  },
  \"resources\": [
    { \"id\": 1, \"name\": \"Nome ou Cargo do Recurso\", \"role\": \"Especialidade\", \"standardRate\": 120, \"type\": \"work\" }
  ],
  \"tasks\": [
    {
      \"id\": 1,
      \"name\": \"1. FASE PRINCIPAL EM MAIÚSCULAS\",
      \"duration\": 10,
      \"start\": \"{$startDate}\",
      \"end\": \"YYYY-MM-DD\",
      \"progress\": 0,
      \"predecessors\": \"\",
      \"resourceIds\": [1],
      \"level\": 0,
      \"isSummary\": true,
      \"notes\": \"\"
    },
    {
      \"id\": 2,
      \"name\": \"Subtarefa específica e acionável\",
      \"duration\": 5,
      \"start\": \"{$startDate}\",
      \"end\": \"YYYY-MM-DD\",
      \"progress\": 0,
      \"predecessors\": \"\",
      \"resourceIds\": [1],
      \"level\": 1,
      \"isSummary\": false,
      \"notes\": \"\"
    },
    {
      \"id\": 3,
      \"name\": \"Marco: Entrega da Fase 1\",
      \"duration\": 0,
      \"start\": \"YYYY-MM-DD\",
      \"end\": \"YYYY-MM-DD\",
      \"progress\": 0,
      \"predecessors\": \"2FS\",
      \"resourceIds\": [],
      \"level\": 1,
      \"milestone\": true,
      \"notes\": \"\"
    }
  ]
}

Regras Cruciais:
1. Níveis hierárquicos: Fases principais têm level: 0 e isSummary: true. Subtarefas têm level: 1 ou level: 2.
2. Cada fase deve conter subtarefas lógicas e pelo menos 1 marco (milestone com duration: 0).
3. Predecessoras devem usar formato MS Project (Ex: '2FS', '3SS', '4FS+2'). Não crie dependências circulares.
4. Distribua prazos em dias úteis plausíveis para o escopo informado pelo usuário.
5. Coerência Rigorosa de Anos e Datas:
   - Todas as datas ('start' e 'end') devem ser calculadas sequencialmente a partir de {$startDate} respeitando a duração em dias úteis de cada atividade.
   - O ano deve pertencer estritamente ao período do projeto ({$startYear} a {$maxYear}). NUNCA gere anos incorretos ou no futuro distante como 2227.
6. Crie entre 3 e 6 fases principais, somando de 12 a 25 tarefas detalhadas no total para dar um cronograma rico e realista.
7. Associe os resourceIds correspondentes a cada atividade.
8. Retorne APENAS o JSON válido, sem comentários ou texto adicional.";

    $userPrompt = "Projeto Solicitado pelo Usuário: " . $prompt;

    $jsonContent = callOpenAiChat($apiKey, $systemPrompt, $userPrompt, true, 0.2);
    $parsed = json_decode($jsonContent, true);

    if (!$parsed || empty($parsed['tasks'])) {
        throw new Exception('A IA não gerou uma estrutura válida de tarefas. Tente novamente.');
    }

    echo json_encode([
        'success' => true,
        'data' => $parsed
    ]);
}

/**
 * 2. Auditor de Riscos, Gargalos e Saúde do Cronograma
 */
function handleAuditProject($data, $apiKey) {
    $project = $data['project'] ?? null;
    $tasks = $data['tasks'] ?? [];

    if (empty($tasks)) {
        throw new Exception('Nenhuma tarefa informada para auditoria.');
    }

    $summaryTasks = [];
    foreach ($tasks as $t) {
        $summaryTasks[] = [
            'id' => $t['id'],
            'wbs' => $t['wbs'] ?? '',
            'name' => $t['name'],
            'duration' => $t['duration'],
            'start' => $t['start'],
            'end' => $t['end'],
            'progress' => $t['progress'] ?? 0,
            'predecessors' => $t['predecessors'] ?? '',
            'isCritical' => !empty($t['isCritical']),
            'isSummary' => !empty($t['isSummary']),
            'milestone' => !empty($t['milestone'])
        ];
    }

    $systemPrompt = "Você é um Auditor Especialista Sênior em Gestão de Cronogramas e Análise de Riscos (PMI / PMP / DCMA 14-Point Assessment).
Analise o cronograma fornecido e gere um relatório técnico de auditoria em JSON no seguinte formato:
{
  \"healthScore\": 85,
  \"healthStatus\": \"Excelente\" ou \"Bom\" ou \"Atenção\" ou \"Crítico\",
  \"summary\": \"Resumo executivo da qualidade do cronograma em 2 a 3 frases\",
  \"strengths\": [
    \"Ponto forte 1 identificado no planejamento\",
    \"Ponto forte 2\"
  ],
  \"bottlenecks\": [
    {
      \"title\": \"Gargalo ou Risco Detectado\",
      \"severity\": \"alta\" ou \"media\" ou \"baixa\",
      \"affectedTasks\": [\"ID ou Nome da Tarefa\"],
      \"explanation\": \"Por que isso é um risco real de atraso ou estouro de custo?\",
      \"action\": \"O que o gerente de projetos deve fazer imediatamente para mitigar?\"
    }
  ],
  \"recommendations\": [
    \"Recomendação prática 1\",
    \"Recomendação prática 2\"
  ]
}

Analise com rigor:
- Tarefas soltas no tempo (sem predecessoras ou sucessoras).
- Caminho crítico muito extenso ou com folgas zeradas em cadeia.
- Tarefas muito longas (> 15 dias sem marcos intermediários).
- Prazos já vencidos com progresso menor que 100%.";

    $userPrompt = "Analise o seguinte projeto:\nNome: " . ($project['name'] ?? 'Projeto') . "\nTarefas:\n" . json_encode($summaryTasks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $jsonContent = callOpenAiChat($apiKey, $systemPrompt, $userPrompt, true, 0.2);
    $parsed = json_decode($jsonContent, true);

    echo json_encode([
        'success' => true,
        'audit' => $parsed
    ]);
}

/**
 * 3. Gerador de Relatório de Status Executivo (WhatsApp & E-mail)
 */
function handleReportProject($data, $apiKey) {
    $project = $data['project'] ?? null;
    $tasks = $data['tasks'] ?? [];

    $systemPrompt = "Você é um Gestor de Comunicação e Projetos executivo.
Com base nos dados atuais do projeto, gere um relatório de status semanal/periódico em JSON contendo:
{
  \"subject\": \"Assunto recomendado para o e-mail\",
  \"overallProgress\": \"XX%\",
  \"emailBody\": \"Texto formal, elegante e bem formatado em HTML simples (parágrafos e tópicos) para enviar à diretoria, investidores ou clientes\",
  \"whatsappBody\": \"Texto formatado para WhatsApp (usando negritos *palavra*, quebras de linha e emojis profissionais) pronto para copiar e colar em grupos da obra/projeto\",
  \"highlights\": [
    \"Conquista 1 da semana\",
    \"Conquista 2\"
  ],
  \"nextSteps\": [
    \"Meta prioritária 1 para a próxima semana\",
    \"Meta prioritária 2\"
  ],
  \"alerts\": [
    \"Alerta de atenção ou ponto de atenção\"
  ]
}";

    $userPrompt = "Dados do Projeto:\n" . json_encode([
        'project' => $project,
        'totalTasks' => count($tasks),
        'tasks' => array_slice($tasks, 0, 30) // amostra das principais
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $jsonContent = callOpenAiChat($apiKey, $systemPrompt, $userPrompt, true, 0.3);
    $parsed = json_decode($jsonContent, true);

    echo json_encode([
        'success' => true,
        'report' => $parsed
    ]);
}

/**
 * 4. Otimizador de Prazos (Fast-Tracking & Crashing)
 */
function handleOptimizeProject($data, $apiKey) {
    $tasks = $data['tasks'] ?? [];

    $systemPrompt = "Você é um Engenheiro de Planejamento especialista em Compressão de Cronograma (Schedule Compression).
Analise o caminho crítico e sugira estratégias práticas de:
1. Fast-Tracking (Paralelização de tarefas que estavam em série, ex: transformando FS em SS com lag).
2. Crashing (Adição de recursos para reduzir duração nas atividades de menor custo).

Retorne em formato JSON:
{
  \"estimatedTimeSavedDays\": 12,
  \"strategies\": [
    {
      \"type\": \"Fast-Tracking\",
      \"taskName\": \"Nome da Tarefa\",
      \"currentLink\": \"3FS\",
      \"proposedLink\": \"3SS+2\",
      \"daysSaved\": 4,
      \"risk\": \"Baixo / Médio / Alto\",
      \"explanation\": \"Explicação prática\"
    }
  ],
  \"summary\": \"Resumo da otimização proposta\"
}";

    $criticalTasks = array_filter($tasks, function($t) {
        return !empty($t['isCritical']);
    });

    $userPrompt = "Tarefas no Caminho Crítico:\n" . json_encode(array_values($criticalTasks), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $jsonContent = callOpenAiChat($apiKey, $systemPrompt, $userPrompt, true, 0.2);
    $parsed = json_decode($jsonContent, true);

    echo json_encode([
        'success' => true,
        'optimization' => $parsed
    ]);
}
