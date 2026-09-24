/**
 * ProjectClone - Gestão Avançada de Equipe, Histograma de Carga & Nivelamento
 * Padrão PMI / PMP / Primavera P6
 */

const ResourcesView = {
  container: null,
  currentSubTab: 'workload', // 'workload' ou 'sheet'
  selectedFilter: 'all',    // 'all', 'overallocated', ou ID do recurso
  lastLevelingReport: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    State.eventBus.on('resourcesUpdated', () => {
      if (State.project.view === 'resources') this.render();
    });
    State.eventBus.on('tasksUpdated', () => {
      if (State.project.view === 'resources') this.render();
    });
    State.eventBus.on('viewChanged', (view) => {
      if (view === 'resources') this.render();
    });
    State.eventBus.on('langChanged', () => {
      if (State.project.view === 'resources') this.render();
    });

    this.bindEvents();
  },

  render() {
    if (!this.container) return;

    const resources = State.resources || [];
    const tasks = State.tasks || [];
    const currency = State.project.currency || 'BRL';
    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val || 0);

    // 1. Calcular Carga e Conflitos através do Engine
    const workload = ProjectEngine.computeResourceWorkload({ tasks, resources });

    // Sub-aba padrão se não estiver definida
    if (!this.currentSubTab) {
      this.currentSubTab = (workload.totalOverallocatedResources > 0) ? 'workload' : 'sheet';
    }

    // Calcular estatísticas básicas por recurso
    const stats = new Map();
    resources.forEach(r => {
      stats.set(r.id, {
        taskCount: 0,
        totalHours: 0,
        totalCost: 0,
        assignedTasks: []
      });
    });

    let totalProjectLaborCost = 0;
    tasks.forEach(t => {
      if (!t.isSummary && t.resourceIds && t.resourceIds.length) {
        const dur = Math.max(1, t.duration || 1);
        const hours = dur * (ProjectEngine.hoursPerDay || 8);

        t.resourceIds.forEach(resId => {
          const st = stats.get(resId);
          if (st) {
            st.taskCount++;
            st.totalHours += hours;
            const r = resources.find(res => res.id === resId);
            if (r) {
              const c = hours * (r.standardRate || 0);
              st.totalCost += c;
              totalProjectLaborCost += c;
            }
            st.assignedTasks.push(t);
          }
        });
      }
    });

    // 2. Renderizar Template Principal
    this.container.innerHTML = `
      <div class="resources-full-wrap">
        <!-- Topo: Título e KPIs de Equipe -->
        <div class="resources-header-section">
          <div>
            <h2>👥 Gestão Avançada de Equipe & Nivelamento</h2>
            <p class="resources-subtitle">Análise de capacidade, detecção de sobrecargas e nivelamento automático de cronograma</p>
          </div>
          <div class="resources-quick-actions">
            <button class="btn-primary btn-sparkle" id="btnRunLeveling">
              <span>⚡</span> Nivelar Equipe Automaticamente
            </button>
            <button class="btn-secondary" id="btnClearLeveling">
              <span>↩️</span> Limpar Nivelamento
            </button>
            <button class="btn-secondary" id="btnAddResource">
              <span>➕</span> Novo Recurso
            </button>
          </div>
        </div>

        <!-- 4 Cards de Métricas de Equipe -->
        <div class="team-kpis-grid">
          <div class="team-kpi-card">
            <span class="kpi-label">Recursos Cadastrados</span>
            <div class="kpi-val-row">
              <span class="kpi-number">${resources.length}</span>
              <span class="kpi-badge">${resources.filter(r => r.type !== 'material').length} Mão de Obra</span>
            </div>
            <span class="kpi-sub">${resources.filter(r => r.type === 'material').length} Materiais / Equipamentos</span>
          </div>

          <div class="team-kpi-card">
            <span class="kpi-label">Horas Estimadas de Trabalho</span>
            <div class="kpi-val-row">
              <span class="kpi-number">${workload.totalHours}h</span>
              <span class="kpi-badge">${Math.round(workload.totalHours / 8)} dias-homem</span>
            </div>
            <span class="kpi-sub">Jornada padrão de 8h/dia</span>
          </div>

          <div class="team-kpi-card ${workload.totalOverallocatedResources > 0 ? 'kpi-card-danger' : 'kpi-card-success'}">
            <span class="kpi-label">Diagnóstico de Capacidade</span>
            <div class="kpi-val-row">
              <span class="kpi-number ${workload.totalOverallocatedResources > 0 ? 'text-danger' : 'text-success'}">
                ${workload.totalOverallocatedResources > 0 ? workload.totalOverallocatedResources + ' Sobrealocados' : '100% Equilibrado'}
              </span>
            </div>
            <span class="kpi-sub">
              ${workload.totalOverallocatedResources > 0 
                ? `🚨 ${workload.totalConflicts} conflitos de sobrecarga detectados` 
                : '🟢 Nenhuma sobrecarga encontrada'}
            </span>
          </div>

          <div class="team-kpi-card">
            <span class="kpi-label">Custo Total de Mão de Obra</span>
            <div class="kpi-val-row">
              <span class="kpi-number text-success">${fmt(totalProjectLaborCost)}</span>
            </div>
            <span class="kpi-sub">Baseado nas taxas horárias dos recursos</span>
          </div>
        </div>

        <!-- Banner de Alerta se houver Sobrecarga -->
        ${workload.totalOverallocatedResources > 0 ? `
          <div class="workload-alert-banner">
            <div class="alert-icon-box">⚠️</div>
            <div class="alert-content">
              <strong>Sobrecarga de Equipe Detectada no Cronograma!</strong>
              <p>
                Os seguintes profissionais possuem tarefas simultâneas somando mais de 8h/dia:
                <strong style="color: #fff;">${workload.resources.filter(r => r.isOverallocated).map(r => `${r.name} (até ${r.peakHours}h/dia)`).join(', ')}</strong>.
              </p>
            </div>
            <div class="alert-action-buttons">
              <button class="btn-primary btn-alert-level" id="btnBannerLevelNow">
                ⚡ Nivelar Agora
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Barra de Navegação Interna (Sub-Abas + Filtros) -->
        <div class="team-subtabs-bar">
          <div class="team-nav-tabs">
            <button class="team-nav-btn ${this.currentSubTab === 'workload' ? 'active' : ''}" data-subtab="workload">
              📊 Histograma de Carga & Conflitos
            </button>
            <button class="team-nav-btn ${this.currentSubTab === 'sheet' ? 'active' : ''}" data-subtab="sheet">
              📋 Folha de Recursos (Custos & Cadastro)
            </button>
          </div>

          <div class="team-filters-wrap">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Filtrar:</span>
            <select class="team-filter-select" id="teamResourceFilter">
              <option value="all" ${this.selectedFilter === 'all' ? 'selected' : ''}>Todos os Recursos</option>
              <option value="overallocated" ${this.selectedFilter === 'overallocated' ? 'selected' : ''}>Apenas Sobrealocados (${workload.totalOverallocatedResources})</option>
              <optgroup label="Recursos Individuais">
                ${resources.map(r => `
                  <option value="${r.id}" ${String(this.selectedFilter) === String(r.id) ? 'selected' : ''}>${r.name}</option>
                `).join('')}
              </optgroup>
            </select>
          </div>
        </div>

        <!-- Conteúdo da Sub-Aba Ativa -->
        <div class="team-tab-content">
          ${this.currentSubTab === 'workload' 
            ? this.renderWorkloadView(workload, resources, tasks, fmt) 
            : this.renderSheetView(resources, stats, workload, fmt)}
        </div>
      </div>
    `;
  },

  // 3. Renderização do Histograma de Carga
  renderWorkloadView(workload, resources, tasks, fmt) {
    let filteredResources = workload.resources || [];

    if (this.selectedFilter === 'overallocated') {
      filteredResources = filteredResources.filter(r => r.isOverallocated);
    } else if (this.selectedFilter !== 'all') {
      filteredResources = filteredResources.filter(r => String(r.id) === String(this.selectedFilter));
    }

    if (!filteredResources.length) {
      return `
        <div class="team-empty-state">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🎉</div>
          <h3>Nenhum recurso encontrado para este filtro</h3>
          <p class="text-muted">Selecione "Todos os Recursos" para visualizar o histograma completo.</p>
        </div>
      `;
    }

    // Coletar datas ordenadas de trabalho
    const allDatesSet = new Set();
    workload.resources.forEach(r => {
      Object.keys(r.dailyWorkload || {}).forEach(d => allDatesSet.add(d));
    });
    const sortedDates = Array.from(allDatesSet).sort();

    // Renderizar cartões de histograma por recurso
    const chartsHtml = filteredResources.map(res => {
      const isOver = res.isOverallocated;
      const peakLabel = isOver ? `${res.peakHours}h (${res.peakPct}%) 🚨` : `${res.peakHours}h (100%) 🟢`;

      // Colunas do Histograma Diário
      const dayBarsHtml = sortedDates.map(dateStr => {
        const dayData = res.dailyWorkload[dateStr];
        const hours = dayData ? dayData.hours : 0;
        const pct = dayData ? dayData.pct : 0;
        const isDayOver = hours > res.maxHoursPerDay;
        const taskNames = dayData ? dayData.tasks.map(t => `• ${t.name}`).join('\n') : '';

        // Altura proporcional: 8h = 50px, 16h = 100px (máx 110px)
        const barHeight = Math.min(100, Math.round((hours / (res.maxHoursPerDay || 8)) * 50));

        const parts = dateStr.split('-');
        const shortDate = `${parts[2]}/${parts[1]}`;

        return `
          <div class="workload-col ${isDayOver ? 'col-overallocated' : ''}" title="${dateStr}\nCarga: ${hours}h (${pct}%)\n${taskNames}">
            <div class="col-bar-wrap">
              ${hours > 0 ? `
                <div class="col-bar ${isDayOver ? 'bar-danger' : 'bar-normal'}" style="height: ${barHeight}px;">
                  <span class="bar-val">${hours}h</span>
                </div>
              ` : '<div class="col-bar-zero"></div>'}
            </div>
            <span class="col-date-label">${shortDate}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="resource-workload-card ${isOver ? 'card-has-conflict' : ''}">
          <!-- Cabeçalho do Recurso -->
          <div class="res-card-header">
            <div class="res-info-main">
              <div class="res-avatar">${res.type === 'material' ? '📦' : '👤'}</div>
              <div>
                <h3 class="res-title">${res.name}</h3>
                <span class="res-subtitle">${res.role || 'Geral'} • Taxa: ${fmt(res.standardRate)}/h • Capacidade: 8h/dia (100%)</span>
              </div>
            </div>

            <div class="res-status-pills">
              <div class="res-metric-pill">
                <span>Total:</span> <strong>${res.totalHours}h</strong>
              </div>
              <div class="res-metric-pill ${isOver ? 'pill-danger' : 'pill-success'}">
                <span>Pico:</span> <strong>${peakLabel}</strong>
              </div>
              ${isOver ? `
                <span class="badge-alert-over">⚠️ ${res.overallocatedDaysCount} dias em sobrecarga</span>
              ` : `
                <span class="badge-ok-balanced">🟢 Balanceado</span>
              `}
            </div>
          </div>

          <!-- Histograma de Barras -->
          <div class="histogram-scroll-area">
            <div class="histogram-limit-line" style="bottom: 74px;" title="Limite de Capacidade Máxima (8h/dia = 100%)">
              <span class="limit-tag">Limite: 8h/dia (100%)</span>
            </div>
            <div class="histogram-grid">
              ${dayBarsHtml || '<div class="text-muted" style="padding: 1rem;">Nenhuma alocação registrada para este recurso.</div>'}
            </div>
          </div>

          <!-- Conflitos Detalhados deste Recurso -->
          ${isOver ? `
            <div class="res-conflicts-drawer">
              <div class="drawer-title">
                <span>🚨 Conflitos de Tarefas Simultâneas (${res.conflicts.length})</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Múltiplas tarefas agendadas no mesmo dia</span>
              </div>
              <div class="conflicts-chips-list">
                ${res.conflicts.slice(0, 5).map(c => `
                  <div class="conflict-chip">
                    <span class="conflict-chip-date">${c.date}: <strong>${c.hours}h (${c.pct}%)</strong></span>
                    <span class="conflict-chip-tasks">${c.tasks.map(t => t.name).join(' ⚡ ')}</span>
                  </div>
                `).join('')}
                ${res.conflicts.length > 5 ? `<span class="text-muted" style="font-size: 0.75rem; align-self: center;">+ ${res.conflicts.length - 5} outros conflitos</span>` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="workload-cards-container">
        ${chartsHtml}
      </div>
    `;
  },

  // 4. Renderização da Folha Clássica de Recursos
  renderSheetView(resources, stats, workload, fmt) {
    const overMap = new Map();
    (workload.resources || []).forEach(r => overMap.set(r.id, r.isOverallocated));

    const rowsHtml = resources.map(r => {
      const st = stats.get(r.id) || { taskCount: 0, totalHours: 0, totalCost: 0, assignedTasks: [] };
      const isOver = overMap.get(r.id) || false;

      return `
        <tr data-id="${r.id}" class="${isOver ? 'row-overallocated' : ''}">
          <td style="text-align: center;">${r.id}</td>
          <td><strong>${r.name}</strong></td>
          <td><span class="badge-type">${r.type === 'material' ? I18N.t('resMaterial') : I18N.t('resWork')}</span></td>
          <td>${r.role || '-'}</td>
          <td style="text-align: right;">${fmt(r.standardRate || 0)} / h</td>
          <td style="text-align: center;">
            <span class="badge-count" title="${st.assignedTasks.map(t => t.name).join(', ')}">${st.taskCount}</span>
          </td>
          <td style="text-align: right;">${st.totalHours}h</td>
          <td style="text-align: right; font-weight: bold; color: var(--ms-green);">${fmt(st.totalCost)}</td>
          <td style="text-align: center;">
            ${isOver 
              ? '<span class="status-badge-over" title="Recurso com sobrecarga no cronograma">⚠️ Sobrecarga</span>' 
              : '<span class="status-badge-ok">🟢 Normal</span>'}
          </td>
          <td style="text-align: center;">
            <button class="btn-res-action btn-del-res" data-id="${r.id}" title="Excluir Recurso">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="res-sheet-card">
        <table class="res-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">ID</th>
              <th>${I18N.t('resName')}</th>
              <th style="width: 100px;">${I18N.t('resType')}</th>
              <th>${I18N.t('resRole')}</th>
              <th style="width: 130px; text-align: right;">${I18N.t('resRate')}</th>
              <th style="width: 120px; text-align: center;">${I18N.t('resTasksCount')}</th>
              <th style="width: 110px; text-align: right;">Horas Total</th>
              <th style="width: 150px; text-align: right;">${I18N.t('resTotalCost')}</th>
              <th style="width: 130px; text-align: center;">Status de Carga</th>
              <th style="width: 70px; text-align: center;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="10" style="text-align: center; padding: 2.5rem; color: #888;">Nenhum recurso cadastrado ainda. Clique em "+ Novo Recurso".</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  },

  // 5. Execução do Nivelamento Automático
  executeLeveling() {
    State.pushHistory();

    const result = ProjectEngine.levelResources({
      tasks: State.tasks,
      resources: State.resources
    });

    State.recalculateAndSave();
    this.lastLevelingReport = result;
    this.render();

    this.showLevelingReportModal(result);
  },

  // 6. Limpar Nivelamento
  clearLeveling() {
    if (!confirm('Deseja remover todos os atrasos de nivelamento e restaurar as datas originais das tarefas?')) {
      return;
    }

    State.pushHistory();
    ProjectEngine.clearLeveling({
      tasks: State.tasks,
      resources: State.resources
    });
    State.recalculateAndSave();
    this.lastLevelingReport = null;
    this.render();

    if (window.App && window.App.showToast) {
      window.App.showToast('Nivelamento removido. Cronograma original restaurado.');
    }
  },

  // 7. Modal de Relatório de Nivelamento
  showLevelingReportModal(result) {
    const modal = document.getElementById('modalLevelingReport');
    const content = document.getElementById('levelingReportContent');
    if (!modal || !content) {
      if (window.App && window.App.showToast) {
        window.App.showToast(`Nivelamento concluído: ${result.shiftedTasks.length} tarefas reprogramadas.`);
      }
      return;
    }

    if (!result.shiftedTasks.length) {
      content.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">✅</div>
          <h3>Nenhum conflito encontrado!</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            A equipe já está totalmente equilibrada e não há tarefas concorrentes para o mesmo profissional.
          </p>
        </div>
      `;
    } else {
      const rows = result.shiftedTasks.map(st => `
        <tr>
          <td><strong>#${st.taskId}</strong></td>
          <td><strong>${st.taskName}</strong></td>
          <td><span class="badge-role">${st.resourceName}</span></td>
          <td style="color: var(--text-muted); text-decoration: line-through;">${st.oldStart}</td>
          <td style="color: var(--ms-green); font-weight: bold;">${st.newStart}</td>
          <td style="text-align: center;"><span class="badge-delay">+${st.daysShifted}d</span></td>
        </tr>
      `).join('');

      content.innerHTML = `
        <div class="level-report-summary">
          <div class="level-stat-box">
            <span>Conflitos Resolvidos</span>
            <strong>${result.resolvedConflicts}</strong>
          </div>
          <div class="level-stat-box">
            <span>Tarefas Reprogramadas</span>
            <strong>${result.shiftedTasks.length}</strong>
          </div>
          <div class="level-stat-box">
            <span>Fim Anterior ➔ Novo Fim</span>
            <strong style="font-size: 0.85rem;">${result.initialEnd} ➔ ${result.finalEnd}</strong>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-muted); margin: 12px 0 6px 0;">
          Tarefas que foram adiadas para respeitar a disponibilidade dos profissionais:
        </p>

        <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
          <table class="eva-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th style="width: 40px;">ID</th>
                <th>Tarefa</th>
                <th>Recurso</th>
                <th>Início Original</th>
                <th>Novo Início</th>
                <th style="width: 70px; text-align: center;">Atraso</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    if (window.App && window.App.openModal) {
      window.App.openModal('modalLevelingReport');
    } else {
      modal.classList.add('active');
    }
  },

  // 8. Eventos de Clique e Interação
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      // Sub-aba
      const tabBtn = e.target.closest('.team-nav-btn');
      if (tabBtn) {
        this.currentSubTab = tabBtn.getAttribute('data-subtab');
        this._userSwitchedTab = true;
        this.render();
        return;
      }

      // Nivelar Automaticamente
      if (e.target.id === 'btnRunLeveling' || e.target.id === 'btnBannerLevelNow' || e.target.closest('#btnRunLeveling') || e.target.closest('#btnBannerLevelNow')) {
        this.executeLeveling();
        return;
      }

      // Limpar Nivelamento
      if (e.target.id === 'btnClearLeveling' || e.target.closest('#btnClearLeveling')) {
        this.clearLeveling();
        return;
      }

      // Adicionar Recurso
      if (e.target.id === 'btnAddResource' || e.target.closest('#btnAddResource')) {
        this.openAddPrompt();
        return;
      }

      // Excluir Recurso
      const delBtn = e.target.closest('.btn-del-res');
      if (delBtn) {
        const id = parseInt(delBtn.getAttribute('data-id'), 10);
        if (confirm('Deseja realmente excluir este recurso?')) {
          State.pushHistory();
          State.resources = State.resources.filter(r => r.id !== id);
          State.tasks.forEach(t => {
            if (t.resourceIds) {
              t.resourceIds = t.resourceIds.filter(rid => rid !== id);
            }
          });
          State.recalculateAndSave();
          State.eventBus.emit('resourcesUpdated', State.resources);
        }
      }
    });

    // Filtro de recursos
    this.container.addEventListener('change', (e) => {
      if (e.target.id === 'teamResourceFilter') {
        this.selectedFilter = e.target.value;
        this.render();
      }
    });

    // Desfazer nivelamento no modal
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnUndoLevelingModal') {
        if (window.App && window.App.closeAllModals) window.App.closeAllModals();
        this.clearLeveling();
      }
    });
  },

  openAddPrompt() {
    const name = prompt('Nome do Recurso:');
    if (!name || !name.trim()) return;

    const role = prompt('Função / Especialidade:', 'Engenharia') || 'Geral';
    const rate = parseFloat(prompt('Taxa Horária (R$/h ou $/h):', '120')) || 100;

    let maxId = 0;
    (State.resources || []).forEach(r => { if (r.id > maxId) maxId = r.id; });

    State.pushHistory();
    State.resources.push({
      id: maxId + 1,
      name: name.trim(),
      role: role.trim(),
      standardRate: rate,
      type: 'work',
      maxUnits: 100
    });

    State.recalculateAndSave();
    State.eventBus.emit('resourcesUpdated', State.resources);
  }
};

window.ResourcesView = ResourcesView;
