<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Política de Privacidade & LGPD — ProjectPro (4U.IA.BR)</title>
  <meta name="description" content="Política de Privacidade e conformidade LGPD do ProjectPro. Processamento local, privacidade por design e segurança de dados.">
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
    
    .legal-container {
      max-width: 860px;
      margin: 32px auto;
      padding: 36px 40px;
      background: #111e33;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    
    .legal-header {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .legal-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 8px;
    }
    .legal-header p { font-size: 0.9rem; color: #94a3b8; }
    
    h2 { font-size: 1.25rem; font-weight: 700; color: #e2e8f0; margin: 24px 0 10px; display: flex; align-items: center; gap: 8px; }
    h2 i { color: #10b981; font-size: 1rem; }
    p, ul { font-size: 0.925rem; color: #94a3b8; margin-bottom: 16px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    strong { color: #f1f5f9; }
    
    .badge-card {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .badge-card i { font-size: 28px; color: #10b981; }
    .badge-card-text { font-size: 0.9rem; color: #a7f3d0; }
    .badge-card-text strong { color: #ffffff; }

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

  <main style="flex:1; padding: 0 20px;">
    <div class="legal-container">
      <div class="legal-header">
        <h1>Política de Privacidade & LGPD</h1>
        <p>Última atualização: <?php echo date('d/m/Y'); ?> &bull; Ecossistema 4U.IA.BR</p>
      </div>

      <div class="badge-card">
        <i class="fas fa-shield-check"></i>
        <div class="badge-card-text">
          <strong>Arquitetura de Retenção Zero:</strong> Todo o processamento de cronogramas, membros e custos é executado 100% no seu navegador.
        </div>
      </div>

      <h2><i class="fas fa-lock"></i> 1. Compromisso com a Privacidade</h2>
      <p>O <strong>ProjectPro</strong> foi desenvolvido em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Seus cronogramas corporativos e dados de projetos não são monitorados nem enviados para servidores externos.</p>

      <h2><i class="fas fa-microchip"></i> 2. Execução Local no Navegador</h2>
      <p>O aplicativo opera inteiramente em JavaScript dentro do seu navegador. Todas as tarefas, cálculos de caminho crítico, matrizes de recursos e gráficos de Gantt são processados em memória local.</p>

      <h2><i class="fas fa-database"></i> 3. Armazenamento Seguro</h2>
      <p>Ao utilizar o recurso <em>Salvar Projeto</em>, as informações são salvas localmente no seu dispositivo através de arquivos <code>.json</code> ou no armazenamento seguro local (<code>localStorage</code>), garantindo privacidade absoluta.</p>

      <h2><i class="fas fa-envelope"></i> 4. Contato</h2>
      <p>Dúvidas e solicitações podem ser encaminhadas diretamente através da nossa <a href="suporte.php" style="color: #10b981; font-weight: 600; text-decoration: underline;">Central de Suporte</a> ou pelo e-mail <strong>contato@4u.ia.br</strong>.</p>
    </div>
  </main>

  <footer>
    &copy; <?php echo date('Y'); ?> 4U.IA.BR &bull; ProjectPro &bull; Todos os direitos reservados.
  </footer>

</body>
</html>
