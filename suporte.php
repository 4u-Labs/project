<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
$msgSent = false;
$msgError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $assunto = trim($_POST['assunto'] ?? 'Suporte - ProjectPro');
    $mensagem = trim($_POST['mensagem'] ?? '');

    if (!empty($nome) && !empty($email) && !empty($mensagem)) {
        $logDir = __DIR__ . '/uploads';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        $logFile = $logDir . '/messages_log.json';
        $logs = [];
        if (file_exists($logFile)) {
            $logs = json_decode(file_get_contents($logFile), true) ?: [];
        }
        $logs[] = [
            'timestamp' => date('Y-m-d H:i:s'),
            'nome' => $nome,
            'email' => $email,
            'assunto' => $assunto,
            'mensagem' => $mensagem,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
        ];
        file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $to = 'contato@4u.ia.br';
        $subject = 'Suporte ProjectPro: ' . $assunto;
        $body = "Nome: $nome\nE-mail: $email\nData: " . date('d/m/Y H:i:s') . "\nAssunto: $assunto\n\nMensagem:\n$mensagem";
        $headers = "From: contato@4u.ia.br\r\nReply-To: $email\r\nX-Mailer: PHP/" . phpversion();

        @mail($to, $subject, $body, $headers);
        $msgSent = true;
    } else {
        $msgError = true;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Central de Suporte & FAQ — ProjectPro (4U.IA.BR)</title>
  <meta name="description" content="Central de Ajuda, Suporte e Perguntas Frequentes do ProjectPro. Tire suas dúvidas sobre cronogramas e gráficos de Gantt.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    * { box-sizing: border-box !important; margin: 0; padding: 0; font-family: 'Segoe UI', 'Plus Jakarta Sans', system-ui, sans-serif; }
    body { background: #0b1320; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; line-height: 1.7; }
    
    .navbar {
      height: 60px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: #0d1929;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-decoration: none;
      padding: 6px 14px;
      border-radius: 8px;
      background: #132238;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.2s ease;
    }
    .back-btn:hover { color: #fff; border-color: #107c41; transform: translateX(-2px); }
    
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #fff;
      font-weight: 700;
      font-size: 16px;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #107c41;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: #fff;
    }
    
    .container-support {
      max-width: 1000px;
      margin: 32px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }
    @media (max-width: 820px) {
      .container-support { grid-template-columns: 1fr; }
    }
    
    .support-card {
      background: #111e33;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    
    .card-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    /* FAQ ACCORDION */
    .faq-item {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      margin-bottom: 12px;
      background: #0d1929;
      overflow: hidden;
    }
    .faq-question {
      padding: 14px 18px;
      font-size: 13.5px;
      font-weight: 700;
      color: #e2e8f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      transition: all 0.2s;
    }
    .faq-question:hover { color: #10b981; background: rgba(16, 185, 129, 0.08); }
    .faq-answer {
      padding: 0 18px 14px;
      font-size: 13px;
      color: #94a3b8;
      display: none;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 10px;
    }
    .faq-item.active .faq-answer { display: block; }
    .faq-item.active .faq-question i { transform: rotate(180deg); color: #10b981; }
    
    /* CONTACT FORM */
    .form-group { margin-bottom: 16px; }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .form-input, .form-textarea {
      width: 100%;
      background: #09121f;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 10px 14px;
      color: #fff;
      font-size: 13.5px;
      outline: none;
      transition: all 0.2s;
    }
    .form-input:focus, .form-textarea:focus {
      border-color: #107c41;
      box-shadow: 0 0 0 3px rgba(16, 124, 65, 0.25);
    }
    .form-textarea { min-height: 110px; resize: vertical; }
    
    .btn-submit {
      width: 100%;
      height: 44px;
      background: #107c41;
      border: none;
      border-radius: 10px;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(16, 124, 65, 0.35);
      transition: all 0.2s;
    }
    .btn-submit:hover { background: #15803d; transform: translateY(-2px); }
    
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    footer {
      text-align: center;
      padding: 24px;
      font-size: 0.8rem;
      color: #64748b;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: auto;
    }
  </style>
</head>
<body>

  <nav class="navbar">
    <a href="index.html" class="back-btn">
      <i class="fas fa-arrow-left"></i> Voltar ao ProjectPro
    </a>
    <a href="index.html" class="brand-logo">
      <div class="brand-icon"><i class="fas fa-chart-gantt"></i></div>
      <span>ProjectPro <span style="color:#10b981;">365</span></span>
    </a>
  </nav>

  <main class="container-support">
    <div class="support-card">
      <h2 class="card-title"><i class="fas fa-circle-question"></i> Dúvidas Frequentes</h2>

      <div class="faq-item active">
        <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
          <span>Como criar dependências entre tarefas?</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          Selecione a tarefa predecessora e a sucessora e clique no botão <strong>Vincular Tarefas</strong> na aba <em>Tarefa</em>, ou insira o número da tarefa predecessora diretamente na coluna de predecessoras.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
          <span>Como alternar para o Quadro Kanban Ágil?</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          Na aba <strong>Exibição</strong> da Ribbon superior, clique em <strong>Quadro Kanban</strong>. Você poderá arrastar os cartões entre as colunas <em>A Fazer</em>, <em>Em Andamento</em> e <em>Concluído</em>.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
          <span>O que é a Linha de Base (Baseline)?</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          A Linha de Base salva uma "fotografia" do cronograma original do projeto. Assim, conforme as tarefas reais mudarem, você poderá comparar o planejado versus o realizado no Gráfico de Gantt.
        </div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
          <span>Como exportar para PDF ou Excel?</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer">
          Acesse a aba <strong>Arquivo</strong> na Ribbon e escolha <strong>Exportar PDF</strong> ou <strong>Exportar Excel (.xlsx)</strong>.
        </div>
      </div>
    </div>

    <div class="support-card">
      <h2 class="card-title"><i class="fas fa-headset"></i> Suporte Técnico</h2>

      <?php if ($msgSent): ?>
        <div class="alert-success">
          <i class="fas fa-circle-check"></i> Mensagem enviada com sucesso! Entraremos em contato.
        </div>
      <?php endif; ?>

      <form method="POST" action="suporte.php">
        <div class="form-group">
          <label class="form-label">Seu Nome</label>
          <input type="text" name="nome" class="form-input" placeholder="Ex: Ana Souza" required>
        </div>

        <div class="form-group">
          <label class="form-label">Seu E-mail</label>
          <input type="email" name="email" class="form-input" placeholder="ana@empresa.com" required>
        </div>

        <div class="form-group">
          <label class="form-label">Assunto</label>
          <input type="text" name="assunto" class="form-input" placeholder="Ex: Dúvida sobre exportação" required>
        </div>

        <div class="form-group">
          <label class="form-label">Mensagem</label>
          <textarea name="mensagem" class="form-textarea" placeholder="Descreva sua dúvida ou solicitação..." required></textarea>
        </div>

        <button type="submit" class="btn-submit">
          <i class="fas fa-paper-plane"></i> Enviar Mensagem
        </button>
      </form>
    </div>
  </main>

  <footer>
    &copy; <?php echo date('Y'); ?> 4U.IA.BR &bull; ProjectPro &bull; Atendimento e Suporte.
  </footer>

</body>
</html>
