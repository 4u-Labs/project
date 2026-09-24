<?php
$assetVer = filemtime(__DIR__ . '/style.css') ?: time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>ProjectClone - Gestão Profissional de Projetos & Gantt</title>
  
  <meta name="description" content="O melhor software de gerenciamento de projetos, gráficos de Gantt e WBS na web compatível com MS Project.">
  <meta name="theme-color" content="#107c41">

  <!-- PWA & Ícones -->
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/svg+xml" href="icon.svg">
  <link rel="apple-touch-icon" href="icon.svg">

  <link rel="stylesheet" href="style.css?v=<?= $assetVer ?>">
  
  <!-- Google Identity Services (OAuth 2.0) -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>

  <!-- ==========================================================================
       Header Superior da Aplicação
       ========================================================================== -->
  <header class="app-header">
    <div class="app-brand">
      <a href="../index.php" title="Voltar ao OfficeClone®" class="btn-back-office" data-i18n-title="backToOfficeTitle">
        <span>←</span> <span data-i18n="backToOffice">OfficeClone®</span>
      </a>
      <div class="header-divider"></div>
      <img src="icon.svg" alt="ProjectClone" class="app-logo-img">
      <div class="app-title-group">
        <span class="app-name">ProjectClone</span>
        <span class="project-title-badge" id="topProjectTitle" data-action="projectInfo" title="Clique para editar as propriedades do projeto">Projeto</span>
      </div>
    </div>

    <div class="app-header-controls">
      <!-- Desfazer / Refazer Rápido -->
      <button class="btn-header-icon" data-action="undo" title="Desfazer (Ctrl+Z)">↩</button>
      <button class="btn-header-icon" data-action="redo" title="Refazer (Ctrl+Y)">↪</button>
      <button class="btn-header-icon" data-action="saveProject" title="Salvar Projeto (Ctrl+S)">💾</button>
      <button class="btn-header-share" data-action="openShare" title="Compartilhar cronograma em nuvem via link público ou colaborativo">
        <svg class="share-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span data-i18n="actShare">Compartilhar</span>
      </button>

      <!-- Idioma PT / EN -->
      <div class="lang-btn-group">
        <button class="btn-lang active" id="btnLangPt">PT</button>
        <button class="btn-lang" id="btnLangEn">EN</button>
      </div>

      <!-- Alternador Tema Claro / Escuro -->
      <button class="btn-header-icon" id="btnThemeToggle" title="Alternar Tema Claro/Escuro">☀️</button>
    </div>
  </header>

  <!-- ==========================================================================
       Fluent Ribbon Bar (Menus & Ferramentas)
       ========================================================================== -->
  <div class="ribbon-container">
    <div class="ribbon-tabs-bar">
      <div class="ribbon-tabs-list">
        <button class="ribbon-tab active" data-tab="tabTask" data-i18n="tabTask">Tarefa</button>
        <button class="ribbon-tab tab-ai-highlight" data-tab="tabAi" data-i18n="tabAi">🤖 IA & Automação</button>
        <button class="ribbon-tab" data-tab="tabResource" data-i18n="tabResource">Equipe</button>
        <button class="ribbon-tab" data-tab="tabFile" data-i18n="tabFile">Arquivo</button>
        <button class="ribbon-tab" data-tab="tabView" data-i18n="tabView">Exibir</button>
        <button class="ribbon-tab" data-tab="tabProject" data-i18n="tabProject">Projeto</button>
      </div>

      <!-- Seletor de Modos de Visualização -->
      <div class="view-mode-tabs">
        <button class="view-tab-btn active" data-view="gantt">
          <span>📊</span> <span data-i18n="viewGantt">Gráfico de Gantt</span>
        </button>
        <button class="view-tab-btn" data-view="kanban">
          <span>📋</span> <span data-i18n="viewKanban">Quadro Kanban</span>
        </button>
        <button class="view-tab-btn" data-view="resources">
          <span>👥</span> <span data-i18n="viewResources">Recursos</span>
        </button>
        <button class="view-tab-btn" data-view="dashboard">
          <span>📊</span> <span data-i18n="viewDashboard">Painel & KPIs</span>
        </button>
        <button class="view-tab-btn" data-view="curvaS">
          <span>📈</span> <span>Curva S & EVA</span>
        </button>
        <button class="view-tab-btn" data-view="calendar">
          <span>📅</span> <span data-i18n="viewCalendar">Calendário</span>
        </button>
        <button class="view-tab-btn" data-view="portfolio">
          <span>📁</span> <span data-i18n="viewPortfolio">Portfólio</span>
        </button>
      </div>
    </div>

    <!-- Painéis do Ribbon -->
    <div class="ribbon-panels">
      <!-- Painel: TAREFA (Ativo por padrão) -->
      <div class="ribbon-panel active" data-panel="tabTask">
        <div class="ribbon-group">
          <button class="ribbon-btn btn-ai-sparkle" data-action="openAiGenerate" title="Criar cronograma completo por prompt com IA">
            <span class="r-icon">🪄</span>
            <span class="r-text" data-i18n="actAiGenerate">Gerar com IA</span>
          </button>
          <button class="ribbon-btn" data-action="addTask">
            <span class="r-icon">➕</span>
            <span class="r-text" data-i18n="actAddTask">Nova Tarefa</span>
          </button>
          <button class="ribbon-btn" data-action="addMilestone">
            <span class="r-icon">💎</span>
            <span class="r-text" data-i18n="actAddMilestone">Novo Marco</span>
          </button>
          <button class="ribbon-btn" data-action="addSummary">
            <span class="r-icon">📑</span>
            <span class="r-text" data-i18n="actAddSummary">Nova Fase</span>
          </button>
          <button class="ribbon-btn" data-action="deleteTask">
            <span class="r-icon">🗑️</span>
            <span class="r-text" data-i18n="actDeleteTask">Excluir</span>
          </button>
          <span class="ribbon-group-title">Inserção</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="indent">
            <span class="r-icon">➡️</span>
            <span class="r-text" data-i18n="actIndent">Recuar</span>
          </button>
          <button class="ribbon-btn" data-action="outdent">
            <span class="r-icon">⬅️</span>
            <span class="r-text" data-i18n="actOutdent">Avançar</span>
          </button>
          <button class="ribbon-btn" data-action="moveUp">
            <span class="r-icon">⬆️</span>
            <span class="r-text" data-i18n="actMoveUp">Mover P/ Cima</span>
          </button>
          <button class="ribbon-btn" data-action="moveDown">
            <span class="r-icon">⬇️</span>
            <span class="r-text" data-i18n="actMoveDown">Mover P/ Baixo</span>
          </button>
          <span class="ribbon-group-title">Estrutura WBS</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="complete100">
            <span class="r-icon">✅</span>
            <span class="r-text" data-i18n="actComplete100">Concluir 100%</span>
          </button>
          <button class="ribbon-btn" data-action="properties">
            <span class="r-icon">⚙️</span>
            <span class="r-text" data-i18n="actProperties">Propriedades</span>
          </button>
          <span class="ribbon-group-title">Ações</span>
        </div>
      </div>

      <!-- Painel: IA & AUTOMAÇÃO -->
      <div class="ribbon-panel" data-panel="tabAi">
        <div class="ribbon-group">
          <button class="ribbon-btn btn-ai-sparkle" data-action="openAiGenerate">
            <span class="r-icon">🪄</span>
            <span class="r-text" data-i18n="actAiGenerate">Gerar com IA</span>
          </button>
          <span class="ribbon-group-title">Prompt-to-Gantt</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="openAiAudit">
            <span class="r-icon">🛡️</span>
            <span class="r-text" data-i18n="actAiAudit">Auditar Riscos</span>
          </button>
          <button class="ribbon-btn" data-action="openAiOptimize">
            <span class="r-icon">⚡</span>
            <span class="r-text" data-i18n="actAiOptimize">Otimizar Prazos</span>
          </button>
          <span class="ribbon-group-title">Engenharia Preditiva</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="openAiReport">
            <span class="r-icon">📝</span>
            <span class="r-text" data-i18n="actAiReport">Relatório Executivo</span>
          </button>
          <span class="ribbon-group-title">Comunicação</span>
        </div>
      </div>

      <!-- Painel: ARQUIVO -->
      <div class="ribbon-panel" data-panel="tabFile">
        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="newProject">
            <span class="r-icon">📄</span>
            <span class="r-text" data-i18n="actNew">Novo</span>
          </button>
          <button class="ribbon-btn" data-action="openPortfolio" title="Gerenciar múltiplos projetos salvos e visão consolidada">
            <span class="r-icon">📁</span>
            <span class="r-text">Portfólio</span>
          </button>
          <button class="ribbon-btn" data-action="openShare" title="Compartilhar cronograma em nuvem com link público ou somente leitura">
            <span class="r-icon">☁️</span>
            <span class="r-text">Compartilhar</span>
          </button>
          <button class="ribbon-btn" data-action="openTemplates">
            <span class="r-icon">🌟</span>
            <span class="r-text" data-i18n="actTemplates">Modelos</span>
          </button>
          <button class="ribbon-btn" data-action="openProject">
            <span class="r-icon">📂</span>
            <span class="r-text" data-i18n="actOpen">Abrir JSON</span>
          </button>
          <button class="ribbon-btn" data-action="saveProject">
            <span class="r-icon">💾</span>
            <span class="r-text" data-i18n="actSave">Salvar</span>
          </button>
          <button class="ribbon-btn" data-action="exportJson">
            <span class="r-icon">📦</span>
            <span class="r-text" data-i18n="actSaveAs">Baixar JSON</span>
          </button>
          <span class="ribbon-group-title">Projeto</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="exportXml">
            <span class="r-icon">📐</span>
            <span class="r-text">MS Project (XML)</span>
          </button>
          <button class="ribbon-btn" data-action="importXml">
            <span class="r-icon">📥</span>
            <span class="r-text" data-i18n="actImportXml">Importar XML</span>
          </button>
          <button class="ribbon-btn" data-action="exportCsv">
            <span class="r-icon">📊</span>
            <span class="r-text" data-i18n="actExportExcel">Excel (CSV)</span>
          </button>
          <button class="ribbon-btn" data-action="exportPdf">
            <span class="r-icon">🖨️</span>
            <span class="r-text" data-i18n="actExportPdf">PDF / Imprimir</span>
          </button>
          <button class="ribbon-btn" data-action="exportPng" title="Exportar imagem PNG em alta resolução (300 DPI) do cronograma">
            <span class="r-icon">📸</span>
            <span class="r-text">Imagem (PNG)</span>
          </button>
          <span class="ribbon-group-title">Interoperabilidade</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="about">
            <span class="r-icon">ℹ️</span>
            <span class="r-text" data-i18n="actAbout">Sobre</span>
          </button>
          <span class="ribbon-group-title">Ajuda</span>
        </div>
      </div>

      <!-- Painel: EXIBIR -->
      <div class="ribbon-panel" data-panel="tabView">
        <div class="ribbon-group">
          <div class="ribbon-control-item">
            <span>🔍 Zoom:</span>
            <select id="selectZoom" class="ribbon-select">
              <option value="day" data-i18n="zoomDays">Dias</option>
              <option value="week" data-i18n="zoomWeeks">Semanas</option>
              <option value="month" data-i18n="zoomMonths">Meses</option>
              <option value="quarter" data-i18n="zoomQuarters">Trimestres</option>
            </select>
          </div>
          <span class="ribbon-group-title">Escala Temporal</span>
        </div>

        <div class="ribbon-group">
          <div class="ribbon-control-item">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="chkCriticalPath">
              <span data-i18n="actCriticalPath">🔥 Caminho Crítico</span>
            </label>
          </div>
          <div class="ribbon-control-item" style="margin-left: 10px;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" id="chkBaseline">
              <span data-i18n="actShowBaseline">Exibir Linha de Base</span>
            </label>
          </div>
          <div class="ribbon-control-item" style="margin-left: 10px;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;" title="Exibir mini-mapa panorâmico no topo do gráfico">
              <input type="checkbox" id="chkMinimap" checked>
              <span>🗺️ Mini-Mapa</span>
            </label>
          </div>
          <span class="ribbon-group-title">Camadas Visuais</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="recalculate">
            <span class="r-icon">🔄</span>
            <span class="r-text" data-i18n="actRecalculate">Recalcular</span>
          </button>
          <span class="ribbon-group-title">Motor</span>
        </div>
      </div>

      <!-- Painel: PROJETO -->
      <div class="ribbon-panel" data-panel="tabProject">
        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="saveBaseline">
            <span class="r-icon">📌</span>
            <span class="r-text" data-i18n="actSaveBaseline">Salvar Linha de Base</span>
          </button>
          <button class="ribbon-btn" data-action="calendarSettings">
            <span class="r-icon">📅</span>
            <span class="r-text">Feriados & Dias</span>
          </button>
          <button class="ribbon-btn" data-action="projectInfo">
            <span class="r-icon">⚙️</span>
            <span class="r-text" data-i18n="actProjectInfo">Informações</span>
          </button>
          <span class="ribbon-group-title">Configurações</span>
        </div>
      </div>

      <!-- Painel: EQUIPE & RECURSOS -->
      <div class="ribbon-panel" data-panel="tabResource">
        <div class="ribbon-group">
          <button class="ribbon-btn btn-ai-sparkle" data-action="levelResources" title="Reprogramar tarefas concorrentes para eliminar sobrecarga">
            <span class="r-icon">⚡</span>
            <span class="r-text" data-i18n="resLevel">Nivelar Equipe</span>
          </button>
          <button class="ribbon-btn" data-action="clearLeveling" title="Remover atrasos e restaurar datas originais">
            <span class="r-icon">↩️</span>
            <span class="r-text" data-i18n="resClearLevel">Limpar Nivelamento</span>
          </button>
          <span class="ribbon-group-title">Nivelamento Automático</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="openWorkload" title="Ver Histograma e Conflitos Diários">
            <span class="r-icon">📊</span>
            <span class="r-text" data-i18n="resWorkload">Histograma</span>
          </button>
          <button class="ribbon-btn" data-action="openResourceSheet" title="Ver Folha de Custos e Taxas">
            <span class="r-icon">📋</span>
            <span class="r-text" data-i18n="resSheet">Folha de Recursos</span>
          </button>
          <span class="ribbon-group-title">Visualizações</span>
        </div>

        <div class="ribbon-group">
          <button class="ribbon-btn" data-action="addResource" title="Cadastrar Novo Profissional ou Material">
            <span class="r-icon">➕</span>
            <span class="r-text" data-i18n="resAdd">Novo Recurso</span>
          </button>
          <span class="ribbon-group-title">Cadastro</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       Workspace Principal
       ========================================================================== -->
  <main class="main-workspace">
    <!-- Visualização 1: Gráfico de Gantt + Tabela WBS (Split-View) -->
    <div class="split-view-container" id="splitView">
      <div class="wbs-pane" id="wbsPane"></div>
      <div class="split-handle" id="splitHandle" title="Arraste para redimensionar a divisão"></div>
      <div class="gantt-pane" id="ganttPane"></div>
    </div>

    <!-- Visualização 2: Quadro Kanban -->
    <div class="kanban-view-container" id="kanbanContainer" style="display: none;"></div>

    <!-- Visualização 3: Folha de Recursos -->
    <div class="resources-view-container" id="resourcesContainer" style="display: none;"></div>

    <!-- Visualização 4: Dashboard Executivo -->
    <div class="dashboard-view-container" id="dashboardContainer" style="display: none;"></div>

    <!-- Visualização 5: Curva S & Valor Agregado (EVA) -->
    <div class="curva-s-view-container" id="curvaSContainer" style="display: none;"></div>

    <!-- Visualização 6: Calendário Mensal -->
    <div class="calendar-view-container" id="calendarContainer" style="display: none;"></div>

    <!-- Visualização 7: Portfólio & Gerenciamento Multi-Projetos -->
    <div class="portfolio-view-container" id="portfolioContainer" style="display: none;"></div>
  </main>

  <!-- Inputs Ocultos de Arquivo -->
  <input type="file" id="fileInputXml" accept=".xml" style="display: none;">
  <input type="file" id="fileInputJson" accept=".json,.projectclone" style="display: none;">

  <!-- ==========================================================================
       Modais de Diálogo
       ========================================================================== -->

  <!-- Modal: Propriedades da Tarefa -->
  <div class="modal-overlay" id="modalTaskDetails">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3><span data-i18n="modalTaskTitle">Detalhes da Tarefa</span> #<span id="taskPropWbs"></span></h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <form id="formTaskDetails">
        <div class="modal-body">
          <input type="hidden" id="taskPropId">

          <div class="form-group">
            <label data-i18n="colName">Nome da Tarefa</label>
            <input type="text" id="taskPropName" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label data-i18n="colDuration">Duração (dias)</label>
              <input type="number" id="taskPropDuration" min="0">
            </div>
            <div class="form-group">
              <label data-i18n="colProgress">% Concluído</label>
              <input type="number" id="taskPropProgress" min="0" max="100">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label data-i18n="colStart">Data de Início</label>
              <input type="date" id="taskPropStart">
            </div>
            <div class="form-group">
              <label data-i18n="colEnd">Data de Término</label>
              <input type="date" id="taskPropEnd">
            </div>
          </div>

          <div class="form-group">
            <label data-i18n="colPredecessors">Predecessoras (Ex: 2FS, 3SS+2)</label>
            <input type="text" id="taskPropPreds" placeholder="Ex: 2FS, 3">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Restrição (Constraint)</label>
              <select id="taskPropConstraintType">
                <option value="ASAP">O Mais Cedo Possível (ASAP - Padrão)</option>
                <option value="ALAP">O Mais Tarde Possível (ALAP)</option>
                <option value="SNET">Não Iniciar Antes De (SNET)</option>
                <option value="SNLT">Não Iniciar Depois De (SNLT)</option>
                <option value="FNET">Não Terminar Antes De (FNET)</option>
                <option value="FNLT">Não Terminar Depois De (FNLT)</option>
                <option value="MSO">Deve Iniciar Em (MSO)</option>
                <option value="MFO">Deve Terminar Em (MFO)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data Limite da Restrição</label>
              <input type="date" id="taskPropConstraintDate">
            </div>
          </div>

          <div class="form-group">
            <label data-i18n="colResources">Recursos Atribuídos</label>
            <div id="taskResList" style="max-height: 120px; overflow-y: auto; background: var(--bg-app); padding: 8px; border-radius: 6px; border: 1px solid var(--border-color);"></div>
          </div>

          <div class="form-group">
            <label>Anotações / Observações</label>
            <textarea id="taskPropNotes" rows="2" placeholder="Detalhes técnicos ou orientações de campo..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary btn-modal-cancel" data-i18n="btnCancel">Cancelar</button>
          <button type="submit" class="btn-primary" data-i18n="btnSave">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Modelos de Projetos -->
  <div class="modal-overlay" id="modalTemplates">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 data-i18n="modalTemplatesTitle">Escolha um Modelo Profissional</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="template-cards-list">
          <div class="template-card-btn" data-template="construction">
            <div class="tmpl-icon">🏗️</div>
            <div>
              <div class="tmpl-title">Construção Civil & Reformas de Edifícios</div>
              <div class="tmpl-desc">Cronograma completo com fundação, estrutura de concreto, alvenaria, instalações elétricas/hidráulicas, acabamentos e entrega de chaves.</div>
            </div>
          </div>

          <div class="template-card-btn" data-template="software">
            <div class="tmpl-icon">💻</div>
            <div>
              <div class="tmpl-title">Desenvolvimento de Software (SaaS / Web App)</div>
              <div class="tmpl-desc">Discovery, UX/UI Design, Arquitetura Cloud, Backend API, Frontend Web, QA/Testes e Deploy em Produção com marcos técnicos.</div>
            </div>
          </div>

          <div class="template-card-btn" data-template="marketing">
            <div class="tmpl-icon">🚀</div>
            <div>
              <div class="tmpl-title">Lançamento de Produto & Marketing Digital</div>
              <div class="tmpl-desc">Pesquisa de personas, produção de vídeos e criativos, landing pages, tráfego pago, webinário ao vivo e abertura de carrinho.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close" data-i18n="btnClose">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Configurações do Projeto -->
  <div class="modal-overlay" id="modalProjectSettings">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 data-i18n="modalProjectTitle">Configurações do Projeto</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <form id="formProjectSettings">
        <div class="modal-body">
          <div class="form-group">
            <label>Nome do Projeto</label>
            <input type="text" id="cfgProjectName" required>
          </div>
          <div class="form-group">
            <label>Moeda Orçamentária</label>
            <select id="cfgCurrency">
              <option value="BRL">Real Brasileiro (R$)</option>
              <option value="USD">Dólar Americano ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary btn-modal-cancel" data-i18n="btnCancel">Cancelar</button>
          <button type="submit" class="btn-primary" data-i18n="btnSave">Salvar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Sobre o ProjectClone -->
  <div class="modal-overlay" id="modalAbout">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 data-i18n="modalAboutTitle">Sobre o ProjectClone</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <div class="modal-body" style="font-size: 0.9rem; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="icon.svg" style="width: 64px; height: 64px; border-radius: 14px;" alt="Logo">
          <h2 style="font-size: 1.4rem; margin-top: 6px;">ProjectClone</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Versão 1.0 Professional • Desenvolvido por 4u-Labs</p>
        </div>

        <p>O <strong>ProjectClone</strong> é uma plataforma moderna e completa de gerenciamento de cronogramas e projetos inspirada no Microsoft Project, trazendo alto rendimento e fluidez diretamente no navegador:</p>

        <ul style="padding-left: 20px; margin: 10px 0; color: var(--text-muted);">
          <li>📊 Gráfico de Gantt interativo com curvas SVG de dependências.</li>
          <li>🔥 Cálculo automático de <strong>Caminho Crítico (CPM)</strong>.</li>
          <li>📌 Comparação visual com <strong>Linha de Base (Baseline)</strong>.</li>
          <li>📋 Quadro Kanban sincronizado em tempo real.</li>
          <li>👥 Gestão de Recursos e Custos orçados.</li>
          <li>📐 Totalmente compatível com arquivos XML do <strong>Microsoft Project</strong>.</li>
          <li>💾 Modo PWA com funcionamento 100% offline.</li>
        </ul>

        <div style="background: var(--bg-panel); padding: 10px; border-radius: 6px; font-size: 0.8rem; margin-top: 10px;">
          <strong>Atalhos de Teclado Rápidos:</strong><br>
          • <code>Ctrl + S</code>: Salvar Projeto<br>
          • <code>Ctrl + Z</code>: Desfazer (Undo)<br>
          • <code>Ctrl + Y</code>: Refazer (Redo)<br>
          • <code>Insert</code>: Inserir Nova Tarefa<br>
          • <code>Delete</code>: Excluir Tarefa Selecionada<br>
          • <code>Alt + Shift + ➡️ / ⬅️</code>: Recuar / Avançar Nível WBS
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close" data-i18n="btnClose">Fechar</button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       Modais de Inteligência Artificial
       ========================================================================== -->

  <!-- Modal 1: Gerador de Cronograma com IA -->
  <div class="modal-overlay" id="modalAiGenerate">
    <div class="modal-dialog" style="max-width: 640px;">
      <div class="modal-header">
        <h3>🪄 Gerador de Cronogramas por Prompt com IA</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <form id="formAiGenerate">
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">
            Descreva o objetivo do projeto em linguagem natural. A IA criará a EAP completa com fases, subtarefas, durações, predecessoras lógicas e equipe recomendada.
          </p>

          <!-- Sugestões Rápidas -->
          <div class="ai-chips-box">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Sugestões Rápidas:</span>
            <div class="ai-chips-list">
              <button type="button" class="ai-prompt-chip" data-prompt="Reforma completa de apartamento residencial de 85m² em 45 dias, incluindo demolição, elétrica, porcelanato, gesso, pintura e marcenaria.">🏗️ Reforma de Apartamento (45d)</button>
              <button type="button" class="ai-prompt-chip" data-prompt="Construção de galpão industrial pré-moldado de 1.200m² em 120 dias com terraplanagem, fundação, cobertura metálica e piso usinado.">🏢 Galpão Industrial (120d)</button>
              <button type="button" class="ai-prompt-chip" data-prompt="Desenvolvimento de aplicativo mobile de entrega de comida para iOS e Android em 90 dias, com backend API, gateway de pagamento e painel do restaurante.">📱 App Mobile Delivery (90d)</button>
              <button type="button" class="ai-prompt-chip" data-prompt="Instalação e homologação de usina de energia solar fotovoltaica comercial de 75kWp em 30 dias com projeto, compras, montagem e conexão à rede.">⚡ Energia Solar (30d)</button>
            </div>
          </div>

          <div class="form-group" style="margin-top: 10px;">
            <label>Descrição Detalhada do Projeto</label>
            <textarea id="aiPromptInput" rows="4" placeholder="Ex: Construção de uma casa de campo de 150m² em 5 meses, com 3 suítes, varanda gourmet e piscina..." required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data de Início Prevista</label>
              <input type="date" id="aiStartDate">
            </div>
            <div class="form-group">
              <label>Moeda de Orçamento</label>
              <select id="aiCurrency">
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary btn-modal-cancel">Cancelar</button>
          <button type="submit" class="btn-primary btn-ai-sparkle">🚀 Gerar Cronograma com IA</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 2: Auditoria de Riscos com IA -->
  <div class="modal-overlay" id="modalAiAudit">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <h3>🛡️ Auditoria Preditiva de Riscos & Gargalos (IA)</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
            Auditoria algorítmica profunda baseada nas melhores práticas PMI / DCMA 14-Point.
          </p>
          <button class="btn-primary" id="btnRunAiAudit">🔄 Executar Auditoria</button>
        </div>

        <div id="aiAuditResults" style="display: none;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Modal 3: Relatório de Status Executivo -->
  <div class="modal-overlay" id="modalAiReport">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <h3>📝 Relatório de Status Executivo com IA</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
            Gera comunicações prontas para WhatsApp e e-mail com as conquistas e metas da semana.
          </p>
          <button class="btn-primary" id="btnRunAiReport">🔄 Atualizar Relatório</button>
        </div>

        <div id="aiReportResults" style="display: none;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Modal 4: Otimizador de Prazos -->
  <div class="modal-overlay" id="modalAiOptimize">
    <div class="modal-dialog" style="max-width: 680px;">
      <div class="modal-header">
        <h3>⚡ Otimizador de Prazos (Fast-Tracking & Crashing)</h3>
        <button class="btn-modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
            A IA analisa as folgas e dependências do caminho crítico para encurtar a entrega final.
          </p>
          <button class="btn-primary" id="btnRunAiOptimize">⚡ Encontrar Otimizações</button>
        </div>

        <div id="aiOptimizeResults" style="display: none;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Calendário & Feriados Nacionais -->
  <div class="modal-overlay" id="modalCalendarSettings">
    <div class="modal-card" style="max-width: 520px;">
      <div class="modal-header">
        <h3 class="modal-title">📅 Calendário de Trabalho & Feriados</h3>
        <button type="button" class="btn-modal-close" aria-label="Fechar">✕</button>
      </div>
      <form id="formCalendarSettings">
        <div class="modal-body">
          <div class="form-group mb-3">
            <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer;">
              <input type="checkbox" id="calUseNationalHolidays" checked>
              <span>Respeitar Feriados Nacionais Brasileiros (CLT)</span>
            </label>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; margin-left: 24px;">
              Inclui feriados móveis (Carnaval, Sexta-Feira Santa, Corpus Christi pelo algoritmo de Gauss) e feriados fixos (Tiradentes, Independência, Consciência Negra, Natal, etc.).
            </p>
          </div>

          <div class="form-group mb-2">
            <label style="font-weight: 600; margin-bottom: 8px; display: block;">Dias Úteis da Semana</label>
            <div class="workdays-checkbox-grid">
              <label class="cal-day-chk"><input type="checkbox" id="calDay_1" checked> <span>Seg</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_2" checked> <span>Ter</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_3" checked> <span>Qua</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_4" checked> <span>Qui</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_5" checked> <span>Sex</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_6"> <span>Sáb</span></label>
              <label class="cal-day-chk"><input type="checkbox" id="calDay_0"> <span>Dom</span></label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary btn-modal-close">Cancelar</button>
          <button type="submit" class="btn-primary">Salvar Calendário</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Relatório de Nivelamento de Recursos -->
  <div class="modal-overlay" id="modalLevelingReport">
    <div class="modal-card" style="max-width: 640px;">
      <div class="modal-header">
        <h3 class="modal-title">⚡ Relatório de Nivelamento de Equipe</h3>
        <button type="button" class="btn-modal-close" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div id="levelingReportContent"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary" id="btnUndoLevelingModal">↩️ Desfazer Nivelamento</button>
        <button type="button" class="btn-primary btn-modal-close">Concluir</button>
      </div>
    </div>
  </div>

  <!-- Modal: Compartilhamento em Nuvem & Link Público -->
  <div class="modal-overlay" id="modalCloudShare">
    <div class="modal-card" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">☁️ Compartilhar Cronograma na Nuvem</h3>
        <button type="button" class="btn-modal-close" id="btnCloseShareModal" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body">
        <div class="share-modal-proj-card">
          <div class="s-proj-icon">📁</div>
          <div class="s-proj-info">
            <h4 id="shareModalProjTitle">Nome do Projeto</h4>
            <span id="shareModalProjMeta">0 tarefas • Início: -</span>
          </div>
        </div>

        <div class="share-permission-selector">
          <label class="share-perm-option">
            <input type="radio" name="sharePermission" value="readonly" checked>
            <div class="perm-card">
              <div class="perm-title">🔒 Somente Leitura (Recomendado)</div>
              <div class="perm-desc">O cliente visualiza o Gantt, Kanban, Curva S e relatórios sem permissão de alterar prazos ou tarefas.</div>
            </div>
          </label>
          <label class="share-perm-option">
            <input type="radio" name="sharePermission" value="editable">
            <div class="perm-card">
              <div class="perm-title">✏️ Editável / Colaborativo</div>
              <div class="perm-desc">Quem receber o link poderá visualizar e continuar editando o cronograma diretamente.</div>
            </div>
          </label>
        </div>

        <button type="button" class="btn-generate-share-link" id="btnGenerateShareLink">
          <span>⚡</span> <span>Gerar Link de Compartilhamento</span>
        </button>

        <!-- Área de Resultado do Link Gerado -->
        <div class="share-result-box" id="shareResultBox" style="display: none;">
          <div class="share-link-row">
            <input type="text" id="inputShareUrl" readonly>
            <button type="button" class="btn-copy-link" id="btnCopyShareUrl">
              <span>📋</span> <span>Copiar</span>
            </button>
          </div>

          <div class="share-quick-channels">
            <a href="#" target="_blank" class="btn-share-channel whatsapp" id="btnShareWhatsApp">
              <span>💬</span> <span>Enviar no WhatsApp</span>
            </a>
          </div>

          <div class="share-qr-wrap">
            <div class="qr-box">
              <img id="imgShareQrCode" alt="QR Code do Cronograma" width="130" height="130">
            </div>
            <span class="qr-hint">Escaneie com a câmera do celular para abrir o cronograma instantaneamente</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary btn-modal-close" id="btnCloseShareModalFooter">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Modal: Login com Google Obrigatório para Recursos de IA -->
  <div class="modal-overlay" id="modalGoogleAuthRequired">
    <div class="modal-card" style="max-width: 480px; text-align: center;">
      <div class="modal-header" style="justify-content: flex-end; border-bottom: none; padding-bottom: 0;">
        <button type="button" class="btn-modal-close" onclick="GoogleAuth.closeAuthModal()" aria-label="Fechar">✕</button>
      </div>
      <div class="modal-body" style="padding-top: 0;">
        <div class="auth-modal-icon">🤖</div>
        <h3 class="auth-modal-title">Desbloqueie a IA do ProjectClone</h3>
        <p class="auth-modal-feature">Recurso selecionado: <strong id="authFeatureName">Inteligência Artificial</strong></p>
        <p class="auth-modal-desc">
          Para criar cronogramas completos por prompt, auditar riscos PMI e gerar relatórios executivos, conecte sua conta Google.
        </p>

        <div class="auth-modal-perks">
          <div class="perk-item"><span>✨</span> <span><strong>10 Créditos Grátis</strong> para novos usuários</span></div>
          <div class="perk-item"><span>⚡</span> <span>Prompt-to-Gantt automático em segundos</span></div>
          <div class="perk-item"><span>🔒</span> <span>100% Seguro e sem senhas adicionais</span></div>
        </div>

        <div class="auth-modal-btn-wrap">
          <button type="button" class="google-login-btn-lg" onclick="GoogleAuth.signIn()">
            <svg class="google-svg" viewBox="0 0 24 24" width="22" height="22">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Entrar com Conta Google</span>
          </button>
        </div>

        <p class="auth-modal-terms">
          Ao continuar, você concorda com nossos <a href="https://4u.ia.br/app/auth/termos.html" target="_blank">Termos</a> e <a href="https://4u.ia.br/app/auth/privacidade.html" target="_blank">Privacidade</a>.
        </p>
      </div>
    </div>
  </div>

  <!-- Scripts da Aplicação em Ordem de Dependência -->
  <script src="js/i18n.js?v=<?= $assetVer ?>"></script>
  <script src="js/engine.js?v=<?= $assetVer ?>"></script>
  <script src="js/state.js?v=<?= $assetVer ?>"></script>
  <script src="js/templates.js?v=<?= $assetVer ?>"></script>
  <script src="js/portfolio.js?v=<?= $assetVer ?>"></script>
  <script src="js/cloud-share.js?v=<?= $assetVer ?>"></script>
  <script src="js/google-auth.js?v=<?= $assetVer ?>"></script>
  <script src="js/wbs-grid.js?v=<?= $assetVer ?>"></script>
  <script src="js/gantt.js?v=<?= $assetVer ?>"></script>
  <script src="js/kanban.js?v=<?= $assetVer ?>"></script>
  <script src="js/resources.js?v=<?= $assetVer ?>"></script>
  <script src="js/dashboard.js?v=<?= $assetVer ?>"></script>
  <script src="js/calendar-view.js?v=<?= $assetVer ?>"></script>
  <script src="js/curva-s-eva.js?v=<?= $assetVer ?>"></script>
  <script src="js/io-msproject.js?v=<?= $assetVer ?>"></script>
  <script src="js/ai-assistant.js?v=<?= $assetVer ?>"></script>
  <script src="js/app.js?v=<?= $assetVer ?>"></script>
</body>
</html>
