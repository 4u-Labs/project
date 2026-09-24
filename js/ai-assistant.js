/**
 * ProjectClone - Assistente de Inteligência Artificial Integrado
 * - Gerador de Cronogramas por Prompt (Prompt-to-Gantt)
 * - Auditoria de Riscos e Gargalos
 * - Relatório de Status Executivo (WhatsApp & E-mail)
 * - Otimizador de Prazos (Fast-Tracking & Crashing)
 */

const AIAssistant = {
  isProcessing: false,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Sugestões de Prompt Rápido
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-prompt-chip');
      if (chip) {
        const promptInput = document.getElementById('aiPromptInput');
        if (promptInput) {
          promptInput.value = chip.getAttribute('data-prompt');
          promptInput.focus();
        }
      }

      // Copiar Relatório WhatsApp
      if (e.target.id === 'btnCopyWhatsAppReport') {
        const text = document.getElementById('aiReportWhatsAppText')?.value;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            App.showToast('✅ Relatório copiado para a área de transferência!');
          });
        }
      }

      // Copiar Relatório E-mail
      if (e.target.id === 'btnCopyEmailReport') {
        const text = document.getElementById('aiReportEmailHtml')?.innerText;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            App.showToast('✅ E-mail copiado para a área de transferência!');
          });
        }
      }
    });

    // Submissão do Gerador de Cronograma
    const formGenerate = document.getElementById('formAiGenerate');
    if (formGenerate) {
      formGenerate.addEventListener('submit', (e) => {
        e.preventDefault();
        const prompt = document.getElementById('aiPromptInput').value.trim();
        const startDate = document.getElementById('aiStartDate').value || ProjectEngine.formatDate(new Date());
        const currency = document.getElementById('aiCurrency').value || 'BRL';

        if (!prompt) return;
        this.generateProject(prompt, startDate, currency);
      });
    }

    // Botão de Executar Auditoria
    const btnRunAudit = document.getElementById('btnRunAiAudit');
    if (btnRunAudit) {
      btnRunAudit.addEventListener('click', () => {
        this.auditSchedule();
      });
    }

    // Botão de Gerar Relatório
    const btnRunReport = document.getElementById('btnRunAiReport');
    if (btnRunReport) {
      btnRunReport.addEventListener('click', () => {
        this.generateStatusReport();
      });
    }

    // Botão de Otimizar Prazos
    const btnRunOptimize = document.getElementById('btnRunAiOptimize');
    if (btnRunOptimize) {
      btnRunOptimize.addEventListener('click', () => {
        this.optimizeSchedule();
      });
    }
  },

  // 1. Gerar Cronograma Completo por Prompt
  async generateProject(promptText, startDate, currency) {
    if (window.GoogleAuth && !GoogleAuth.isLoggedIn()) {
      GoogleAuth.openAuthModal('Gerador de Cronogramas por Prompt', () => {
        this.generateProject(promptText, startDate, currency);
      });
      return;
    }
    if (window.GoogleAuth && !GoogleAuth.hasCredits()) {
      GoogleAuth.showCreditsDepletedModal();
      return;
    }

    if (this.isProcessing) return;
    this.setLoading(true, 'modalAiGenerate', '🧠 Criando Estrutura EAP e Gráfico de Gantt com IA...');

    try {
      const response = await fetch('api/ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt: promptText,
          startDate: startDate,
          currency: currency,
          user: window.GoogleAuth ? GoogleAuth.currentUser : null
        })
      });

      const res = await response.json();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Falha ao gerar projeto com IA.');
      }

      // Consome crédito com sucesso
      if (window.GoogleAuth) GoogleAuth.consumeCredit(1);

      // Carrega o projeto gerado
      State.loadProject(res.data, true);
      App.closeAllModals();
      App.showToast('🚀 Cronograma gerado com sucesso pela Inteligência Artificial!');
      App.switchView('gantt');
    } catch (err) {
      alert('Erro na IA: ' + err.message);
    } finally {
      this.setLoading(false, 'modalAiGenerate');
    }
  },

  // 2. Auditoria de Riscos e Gargalos
  async auditSchedule() {
    if (window.GoogleAuth && !GoogleAuth.isLoggedIn()) {
      GoogleAuth.openAuthModal('Auditoria Preditiva de Riscos PMI', () => {
        this.auditSchedule();
      });
      return;
    }
    if (window.GoogleAuth && !GoogleAuth.hasCredits()) {
      GoogleAuth.showCreditsDepletedModal();
      return;
    }

    if (this.isProcessing) return;
    this.setLoading(true, 'modalAiAudit', '🛡️ Auditando riscos, folgas e caminho crítico...');

    try {
      const response = await fetch('api/ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'audit',
          project: State.project,
          tasks: State.tasks,
          user: window.GoogleAuth ? GoogleAuth.currentUser : null
        })
      });

      const res = await response.json();
      if (!res.success || !res.audit) {
        throw new Error(res.error || 'Falha ao auditar cronograma.');
      }

      if (window.GoogleAuth) GoogleAuth.consumeCredit(1);
      this.renderAuditResults(res.audit);
    } catch (err) {
      alert('Erro na Auditoria: ' + err.message);
    } finally {
      this.setLoading(false, 'modalAiAudit');
    }
  },

  renderAuditResults(audit) {
    const container = document.getElementById('aiAuditResults');
    if (!container) return;

    let scoreColor = '#107c41';
    if (audit.healthScore < 70) scoreColor = '#f59e0b';
    if (audit.healthScore < 50) scoreColor = '#ef4444';

    let bottlenecksHtml = '';
    (audit.bottlenecks || []).forEach(b => {
      let sevCls = 'sev-low';
      if (b.severity === 'alta') sevCls = 'sev-high';
      else if (b.severity === 'media') sevCls = 'sev-med';

      bottlenecksHtml += `
        <div class="ai-risk-card ${sevCls}">
          <div class="risk-card-head">
            <span class="risk-title">⚠️ ${b.title}</span>
            <span class="badge-sev ${sevCls}">${b.severity.toUpperCase()}</span>
          </div>
          <div class="risk-explanation">${b.explanation}</div>
          <div class="risk-action"><strong>Ação Recomendada:</strong> ${b.action}</div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="audit-summary-box">
        <div class="audit-score-circle" style="border-color: ${scoreColor}; color: ${scoreColor};">
          <span class="score-number">${audit.healthScore}%</span>
          <span class="score-label">${audit.healthStatus || 'Saúde'}</span>
        </div>
        <div class="audit-summary-text">
          <h4>Diagnóstico do Cronograma</h4>
          <p>${audit.summary}</p>
        </div>
      </div>

      <div class="audit-section">
        <h4>🚨 Gargalos e Riscos Identificados (${audit.bottlenecks?.length || 0})</h4>
        <div class="risk-cards-list">
          ${bottlenecksHtml || '<p class="text-muted">Nenhum risco crítico detectado no cronograma!</p>'}
        </div>
      </div>

      <div class="audit-section" style="margin-top: 14px;">
        <h4>💡 Recomendações de Gestão</h4>
        <ul class="audit-recom-list">
          ${(audit.recommendations || []).map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `;
    container.style.display = 'block';
  },

  // 3. Relatório de Status Executivo
  async generateStatusReport() {
    if (window.GoogleAuth && !GoogleAuth.isLoggedIn()) {
      GoogleAuth.openAuthModal('Relatório Executivo com IA', () => {
        this.generateStatusReport();
      });
      return;
    }
    if (window.GoogleAuth && !GoogleAuth.hasCredits()) {
      GoogleAuth.showCreditsDepletedModal();
      return;
    }

    if (this.isProcessing) return;
    this.setLoading(true, 'modalAiReport', '📝 Sintetizando progresso e redigindo relatório...');

    try {
      const response = await fetch('api/ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          project: State.project,
          tasks: State.tasks,
          user: window.GoogleAuth ? GoogleAuth.currentUser : null
        })
      });

      const res = await response.json();
      if (!res.success || !res.report) {
        throw new Error(res.error || 'Falha ao redigir relatório.');
      }

      if (window.GoogleAuth) GoogleAuth.consumeCredit(1);
      this.renderReportResults(res.report);
    } catch (err) {
      alert('Erro no Relatório: ' + err.message);
    } finally {
      this.setLoading(false, 'modalAiReport');
    }
  },

  renderReportResults(report) {
    const container = document.getElementById('aiReportResults');
    if (!container) return;

    container.innerHTML = `
      <div class="report-tabs-bar">
        <button class="btn-rep-tab active" data-tab="whatsapp">📱 WhatsApp</button>
        <button class="btn-rep-tab" data-tab="email">✉️ E-mail Executivo</button>
      </div>

      <div class="report-content-panel panel-whatsapp active">
        <textarea id="aiReportWhatsAppText" class="report-textarea" rows="12">${report.whatsappBody || ''}</textarea>
        <div style="margin-top: 8px; text-align: right;">
          <button class="btn-primary" id="btnCopyWhatsAppReport">📋 Copiar Mensagem para WhatsApp</button>
        </div>
      </div>

      <div class="report-content-panel panel-email" style="display: none;">
        <div class="email-subject-box"><strong>Assunto:</strong> ${report.subject || 'Relatório de Status'}</div>
        <div id="aiReportEmailHtml" class="email-body-box">${report.emailBody || ''}</div>
        <div style="margin-top: 8px; text-align: right;">
          <button class="btn-primary" id="btnCopyEmailReport">📋 Copiar Texto do E-mail</button>
        </div>
      </div>
    `;

    container.style.display = 'block';

    // Tabs de alternância
    container.querySelectorAll('.btn-rep-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.btn-rep-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        container.querySelector('.panel-whatsapp').style.display = tab === 'whatsapp' ? 'block' : 'none';
        container.querySelector('.panel-email').style.display = tab === 'email' ? 'block' : 'none';
      });
    });
  },

  // 4. Otimizador de Prazos
  async optimizeSchedule() {
    if (window.GoogleAuth && !GoogleAuth.isLoggedIn()) {
      GoogleAuth.openAuthModal('Otimizador de Prazos (Fast-Tracking)', () => {
        this.optimizeSchedule();
      });
      return;
    }
    if (window.GoogleAuth && !GoogleAuth.hasCredits()) {
      GoogleAuth.showCreditsDepletedModal();
      return;
    }

    if (this.isProcessing) return;
    this.setLoading(true, 'modalAiOptimize', '⚡ Analisando caminhos críticos para Fast-Tracking e Crashing...');

    try {
      const response = await fetch('api/ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          tasks: State.tasks,
          user: window.GoogleAuth ? GoogleAuth.currentUser : null
        })
      });

      const res = await response.json();
      if (!res.success || !res.optimization) {
        throw new Error(res.error || 'Falha ao calcular otimizações.');
      }

      if (window.GoogleAuth) GoogleAuth.consumeCredit(1);
      this.renderOptimizationResults(res.optimization);
    } catch (err) {
      alert('Erro na Otimização: ' + err.message);
    } finally {
      this.setLoading(false, 'modalAiOptimize');
    }
  },

  renderOptimizationResults(opt) {
    const container = document.getElementById('aiOptimizeResults');
    if (!container) return;

    let strategiesHtml = '';
    (opt.strategies || []).forEach(s => {
      strategiesHtml += `
        <div class="ai-opt-card">
          <div class="opt-card-head">
            <span class="opt-type-badge">${s.type}</span>
            <span class="opt-days-saved">-${s.daysSaved} dias</span>
          </div>
          <div class="opt-task-name"><strong>${s.taskName}</strong></div>
          <div class="opt-change">De: <code>${s.currentLink}</code> ➔ Para: <code>${s.proposedLink}</code></div>
          <div class="opt-exp">${s.explanation}</div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="opt-banner">
        <h3>⚡ Redução Potencial de Prazo: <strong>${opt.estimatedTimeSavedDays} dias úteis</strong></h3>
        <p>${opt.summary}</p>
      </div>
      <div class="opt-list">
        ${strategiesHtml || '<p class="text-muted">Nenhuma estratégia de compressão encontrada.</p>'}
      </div>
    `;
    container.style.display = 'block';
  },

  setLoading(isLoading, modalId, message = 'Processando com IA...') {
    this.isProcessing = isLoading;
    const modal = document.getElementById(modalId);
    if (!modal) return;

    let loader = modal.querySelector('.ai-modal-loader');
    if (isLoading) {
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'ai-modal-loader';
        loader.innerHTML = `
          <div class="ai-spinner"></div>
          <div class="ai-loader-text">${message}</div>
        `;
        modal.querySelector('.modal-body')?.prepend(loader);
      }
      loader.style.display = 'flex';
    } else {
      if (loader) loader.style.display = 'none';
    }
  }
};

window.AIAssistant = AIAssistant;
