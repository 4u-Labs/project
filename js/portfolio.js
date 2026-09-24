/**
 * ProjectClone - Gerenciador de Múltiplos Projetos & Portfólio (Portfolio Manager)
 * Permite manter vários projetos simultâneos, alternar entre eles, visão master e clonagem.
 */

const PortfolioManager = {
  KEY_PROJECTS: 'projectclone_portfolio_v1',
  KEY_CURRENT_ID: 'projectclone_current_project_id',
  PREFIX_PROJ_DATA: 'projectclone_proj_',

  projects: [],
  currentProjectId: null,
  container: null,

  init(containerId = 'portfolioContainer') {
    this.container = document.getElementById(containerId);
    this.loadProjectsIndex();

    // Migração transparente de dados legados (projectclone_data_v1)
    this.migrateLegacyIfNeeded();

    // Se não houver projetos, cria o primeiro baseado no Estado atual ou modelo padrão
    if (this.projects.length === 0) {
      this.createInitialProject();
    } else {
      // Garante que o projeto ativo esteja definido
      const storedCurrent = localStorage.getItem(this.KEY_CURRENT_ID);
      const exists = this.projects.some(p => p.id === storedCurrent);
      this.currentProjectId = exists ? storedCurrent : this.projects[0].id;
      localStorage.setItem(this.KEY_CURRENT_ID, this.currentProjectId);
    }

    // Ouve eventos do State para atualizar metadados em tempo real
    State.eventBus.on('tasksUpdated', () => this.syncCurrentProjectSummary());
    State.eventBus.on('projectLoaded', () => this.syncCurrentProjectSummary());
    State.eventBus.on('saved', () => this.syncCurrentProjectSummary());

    this.renderHeaderDropdown();
  },

  // 1. CARREGAR / SALVAR ÍNDICE
  loadProjectsIndex() {
    try {
      const raw = localStorage.getItem(this.KEY_PROJECTS);
      if (raw) {
        this.projects = JSON.parse(raw);
        if (!Array.isArray(this.projects)) this.projects = [];
      } else {
        this.projects = [];
      }
    } catch (e) {
      console.warn('Erro ao carregar índice de projetos:', e);
      this.projects = [];
    }
  },

  saveProjectsIndex() {
    try {
      localStorage.setItem(this.KEY_PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(this.KEY_CURRENT_ID, this.currentProjectId);
      this.renderHeaderDropdown();
    } catch (e) {
      console.error('Erro ao salvar índice de projetos:', e);
    }
  },

  // 2. MIGRAÇÃO DE DADOS LEGADOS
  migrateLegacyIfNeeded() {
    const legacyDataRaw = localStorage.getItem('projectclone_data_v1');
    if (this.projects.length === 0 && legacyDataRaw) {
      try {
        const legacy = JSON.parse(legacyDataRaw);
        const projId = 'proj_' + Date.now();
        const projName = (legacy.project && legacy.project.name) ? legacy.project.name : 'Projeto Residencial Horizonte';
        
        const summary = this.buildProjectSummary(projId, projName, legacy);
        this.projects.push(summary);
        this.currentProjectId = projId;
        
        // Salva dados individuais
        localStorage.setItem(this.PREFIX_PROJ_DATA + projId, legacyDataRaw);
        this.saveProjectsIndex();
        console.log('[Portfolio] Dados legados migrados com sucesso para ID:', projId);
      } catch (e) {
        console.warn('[Portfolio] Falha ao migrar legado:', e);
      }
    }
  },

  createInitialProject() {
    const projId = 'proj_' + Date.now();
    const projName = State.project.name || 'Projeto Residencial Horizonte';
    const data = {
      project: State.project,
      tasks: State.tasks,
      resources: State.resources
    };

    const summary = this.buildProjectSummary(projId, projName, data);
    this.projects.push(summary);
    this.currentProjectId = projId;
    localStorage.setItem(this.PREFIX_PROJ_DATA + projId, JSON.stringify(data));
    this.saveProjectsIndex();
  },

  // 3. AUXILIAR: CALCULAR RESUMO / METADADOS DO PROJETO
  buildProjectSummary(id, name, fullData) {
    const tasks = fullData.tasks || [];
    const project = fullData.project || {};
    const taskCount = tasks.length;
    
    // Progresso médio ponderado pela duração
    let totalDur = 0;
    let earnedDur = 0;
    let criticalCount = 0;
    let totalCost = 0;

    tasks.forEach(t => {
      const dur = t.duration || 1;
      if (!t.isSummary) {
        totalDur += dur;
        earnedDur += dur * ((t.progress || 0) / 100);
      }
      if (t.critical) criticalCount++;
      if (t.cost) totalCost += t.cost;
    });

    const progress = totalDur > 0 ? Math.round((earnedDur / totalDur) * 100) : 0;
    const startDate = project.startDate || (tasks[0] ? tasks[0].start : ProjectEngine.formatDate(new Date()));
    let endDate = startDate;
    tasks.forEach(t => {
      if (t.end && t.end > endDate) endDate = t.end;
    });

    let status = 'in_progress';
    if (progress === 100) status = 'completed';
    else if (progress === 0) status = 'planning';

    return {
      id,
      name,
      createdAt: fullData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: fullData.status || status,
      taskCount,
      progress,
      startDate,
      endDate,
      totalCost,
      criticalCount
    };
  },

  // Atualiza os metadados do projeto ativo a partir do State em memória
  syncCurrentProjectSummary() {
    if (!this.currentProjectId) return;
    const idx = this.projects.findIndex(p => p.id === this.currentProjectId);
    if (idx === -1) return;

    const fullData = {
      project: State.project,
      tasks: State.tasks,
      resources: State.resources,
      createdAt: this.projects[idx].createdAt,
      status: this.projects[idx].status
    };

    const updated = this.buildProjectSummary(this.currentProjectId, State.project.name, fullData);
    this.projects[idx] = Object.assign(this.projects[idx], updated);
    
    // Salva o snapshot completo deste projeto
    try {
      localStorage.setItem(this.PREFIX_PROJ_DATA + this.currentProjectId, JSON.stringify(fullData));
    } catch (e) {
      console.warn('Erro ao salvar snapshot individual do projeto:', e);
    }

    this.saveProjectsIndex();
    this.updateHeaderBadge();
    
    // Se a view do portfólio estiver aberta, re-renderiza
    if (State.project.view === 'portfolio') {
      this.render();
    }
  },

  // 4. OPERAÇÕES DE PROJETO
  // Alterna o projeto ativo
  switchProject(newProjectId) {
    if (newProjectId === this.currentProjectId) return;

    const target = this.projects.find(p => p.id === newProjectId);
    if (!target) return;

    // Salva o atual antes de trocar
    this.syncCurrentProjectSummary();

    // Carrega novo
    const raw = localStorage.getItem(this.PREFIX_PROJ_DATA + newProjectId);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.currentProjectId = newProjectId;
        localStorage.setItem(this.KEY_CURRENT_ID, newProjectId);
        State.loadProject(parsed, false);
        this.updateHeaderBadge();
        
        if (window.App && window.App.showToast) {
          window.App.showToast(`Projeto ativo: "${target.name}"`);
        }
        
        // Se estiver na tela de portfólio, pode voltar para o Gantt
        if (State.project.view === 'portfolio') {
          window.App.switchView('gantt');
        }
        return true;
      } catch (e) {
        console.error('Erro ao carregar projeto:', e);
      }
    }
    return false;
  },

  // Cria um novo projeto
  createNewProject(name, templateKey = null) {
    this.syncCurrentProjectSummary();

    const projId = 'proj_' + Date.now();
    const projName = name || `Novo Projeto ${this.projects.length + 1}`;
    let initialData = null;

    if (templateKey && window.ProjectTemplates) {
      initialData = window.ProjectTemplates.getTemplate(templateKey);
      if (initialData && initialData.project) {
        initialData.project.name = projName;
      }
    }

    if (!initialData) {
      const today = ProjectEngine.formatDate(new Date());
      initialData = {
        project: {
          name: projName,
          startDate: today,
          workDays: [1, 2, 3, 4, 5],
          hoursPerDay: 8,
          currency: 'BRL',
          baselineSaved: false,
          view: 'gantt',
          zoom: 'week',
          showCriticalPath: false,
          showBaseline: false
        },
        tasks: [
          {
            id: 1,
            name: 'Fase Inicial de Planejamento',
            duration: 3,
            start: today,
            end: ProjectEngine.addWorkDays(today, 3),
            progress: 0,
            predecessors: '',
            resourceIds: [],
            level: 0,
            isSummary: true
          },
          {
            id: 2,
            name: 'Levantamento de Requisitos e Escopo',
            duration: 3,
            start: today,
            end: ProjectEngine.addWorkDays(today, 3),
            progress: 0,
            predecessors: '',
            resourceIds: [],
            level: 1,
            isSummary: false
          }
        ],
        resources: [
          { id: 1, name: 'Gerente do Projeto', role: 'Gestor', standardRate: 150, type: 'work' }
        ]
      };
    }

    const summary = this.buildProjectSummary(projId, projName, initialData);
    this.projects.unshift(summary); // Mais recente no topo
    this.currentProjectId = projId;

    localStorage.setItem(this.PREFIX_PROJ_DATA + projId, JSON.stringify(initialData));
    this.saveProjectsIndex();

    State.loadProject(initialData, false);
    this.updateHeaderBadge();

    if (window.App && window.App.showToast) {
      window.App.showToast(`Projeto "${projName}" criado com sucesso!`);
    }

    if (window.App && State.project.view === 'portfolio') {
      window.App.switchView('gantt');
    }
    return projId;
  },

  // Duplicar / Clonar projeto
  duplicateProject(projectId) {
    const origSummary = this.projects.find(p => p.id === projectId);
    if (!origSummary) return;

    let fullDataRaw = localStorage.getItem(this.PREFIX_PROJ_DATA + projectId);
    if (!fullDataRaw && projectId === this.currentProjectId) {
      fullDataRaw = JSON.stringify({
        project: State.project,
        tasks: State.tasks,
        resources: State.resources
      });
    }
    if (!fullDataRaw) return;

    try {
      const dataCopy = JSON.parse(fullDataRaw);
      const newId = 'proj_' + Date.now();
      const newName = `${origSummary.name} (Cópia)`;
      
      if (dataCopy.project) dataCopy.project.name = newName;
      
      const newSummary = this.buildProjectSummary(newId, newName, dataCopy);
      this.projects.unshift(newSummary);
      localStorage.setItem(this.PREFIX_PROJ_DATA + newId, JSON.stringify(dataCopy));
      this.saveProjectsIndex();

      if (window.App && window.App.showToast) {
        window.App.showToast(`Projeto "${newName}" duplicado!`);
      }

      if (State.project.view === 'portfolio') {
        this.render();
      }
    } catch (e) {
      console.error('Erro ao duplicar projeto:', e);
    }
  },

  // Renomear projeto
  renameProject(projectId, newName) {
    const summary = this.projects.find(p => p.id === projectId);
    if (!summary || !newName.trim()) return;

    summary.name = newName.trim();
    summary.updatedAt = new Date().toISOString();

    const raw = localStorage.getItem(this.PREFIX_PROJ_DATA + projectId);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.project) parsed.project.name = summary.name;
        localStorage.setItem(this.PREFIX_PROJ_DATA + projectId, JSON.stringify(parsed));
      } catch (e) {}
    }

    if (projectId === this.currentProjectId) {
      State.project.name = summary.name;
      this.updateHeaderBadge();
    }

    this.saveProjectsIndex();
    if (State.project.view === 'portfolio') this.render();
  },

  // Excluir projeto
  deleteProject(projectId) {
    if (this.projects.length <= 1) {
      alert('Você deve manter pelo menos um projeto no portfólio.');
      return;
    }

    const summary = this.projects.find(p => p.id === projectId);
    const projName = summary ? summary.name : 'este projeto';

    if (!confirm(`Tem certeza que deseja excluir permanentemente o projeto "${projName}"?`)) {
      return;
    }

    // Remove do armazenamento
    localStorage.removeItem(this.PREFIX_PROJ_DATA + projectId);
    this.projects = this.projects.filter(p => p.id !== projectId);

    // Se excluiu o que estava ativo, seleciona o primeiro restante
    if (projectId === this.currentProjectId) {
      const nextProj = this.projects[0];
      this.currentProjectId = nextProj.id;
      localStorage.setItem(this.KEY_CURRENT_ID, nextProj.id);
      
      const raw = localStorage.getItem(this.PREFIX_PROJ_DATA + nextProj.id);
      if (raw) {
        try {
          State.loadProject(JSON.parse(raw), false);
        } catch (e) {}
      }
    }

    this.saveProjectsIndex();
    this.updateHeaderBadge();

    if (window.App && window.App.showToast) {
      window.App.showToast(`Projeto "${projName}" removido.`);
    }

    if (State.project.view === 'portfolio') {
      this.render();
    }
  },

  // Exportar backup do portfólio completo
  exportPortfolioBundle() {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projectsList: this.projects,
      projectsData: {}
    };

    this.projects.forEach(p => {
      const raw = localStorage.getItem(this.PREFIX_PROJ_DATA + p.id);
      if (raw) {
        try { bundle.projectsData[p.id] = JSON.parse(raw); } catch (e) {}
      }
    });

    const jsonStr = JSON.stringify(bundle, null, 2);
    ProjectIO.downloadFile(jsonStr, `Portfolio_ProjectClone_${ProjectEngine.formatDate(new Date())}.json`, 'application/json');
    if (window.App && window.App.showToast) {
      window.App.showToast('📦 Portfólio completo exportado!');
    }
  },

  // 5. INTERFACE DO HEADER (DROPDOWN RÁPIDO)
  renderHeaderDropdown() {
    this.updateHeaderBadge();
    const badge = document.getElementById('topProjectTitle');
    if (!badge || badge.dataset.hasDropdown) return;

    badge.dataset.hasDropdown = 'true';
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleHeaderDropdown();
    });

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('headerProjectDropdown');
      if (menu && !menu.contains(e.target) && e.target !== badge) {
        menu.classList.remove('open');
      }
    });
  },

  updateHeaderBadge() {
    const badge = document.getElementById('topProjectTitle');
    if (!badge) return;
    const current = this.projects.find(p => p.id === this.currentProjectId);
    const title = current ? current.name : (State.project.name || 'Projeto');
    badge.innerHTML = `📁 ${this.escapeHtml(title)} <span class="badge-caret">▾</span>`;
  },

  toggleHeaderDropdown() {
    let menu = document.getElementById('headerProjectDropdown');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'headerProjectDropdown';
      menu.className = 'header-project-dropdown';
      document.body.appendChild(menu);
    }

    if (menu.classList.contains('open')) {
      menu.classList.remove('open');
      return;
    }

    const badge = document.getElementById('topProjectTitle');
    const rect = badge.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;

    // Constrói lista de opções
    const listHtml = this.projects.map(p => {
      const isActive = p.id === this.currentProjectId;
      return `
        <div class="h-proj-item ${isActive ? 'active' : ''}" data-project-id="${p.id}">
          <div class="h-proj-info">
            <span class="h-proj-name">${this.escapeHtml(p.name)}</span>
            <span class="h-proj-meta">${p.taskCount} tarefas • ${p.progress}% concluído</span>
          </div>
          ${isActive ? '<span class="h-proj-check">✓</span>' : ''}
        </div>
      `;
    }).join('');

    menu.innerHTML = `
      <div class="h-dropdown-header">
        <span>Selecione o Projeto</span>
        <button class="btn-sm-text" id="btnOpenFullPortfolio">Ver Portfólio</button>
      </div>
      <div class="h-dropdown-list">
        ${listHtml}
      </div>
      <div class="h-dropdown-footer">
        <button class="btn-dropdown-action" id="btnQuickNewProj">➕ Novo Projeto</button>
        <button class="btn-dropdown-action" id="btnQuickShareProj">☁️ Compartilhar</button>
      </div>
    `;

    menu.classList.add('open');

    // Eventos dos itens do dropdown
    menu.querySelectorAll('.h-proj-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-project-id');
        this.switchProject(id);
        menu.classList.remove('open');
      });
    });

    const btnPortfolio = menu.querySelector('#btnOpenFullPortfolio');
    if (btnPortfolio) {
      btnPortfolio.addEventListener('click', () => {
        menu.classList.remove('open');
        if (window.App) window.App.switchView('portfolio');
      });
    }

    const btnNew = menu.querySelector('#btnQuickNewProj');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        menu.classList.remove('open');
        this.promptNewProject();
      });
    }

    const btnShare = menu.querySelector('#btnQuickShareProj');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        menu.classList.remove('open');
        if (window.CloudShare) window.CloudShare.openModal();
      });
    }
  },

  promptNewProject() {
    const name = prompt('Nome do novo projeto:', 'Novo Empreendimento');
    if (name && name.trim()) {
      this.createNewProject(name.trim());
    }
  },

  // 6. RENDERIZAÇÃO DA VISÃO COMPLETA DE PORTFÓLIO & MASTER GANTT
  render() {
    if (!this.container) return;

    // Métricas Consolidadas do Portfólio
    const totalProjects = this.projects.length;
    let totalTasks = 0;
    let sumProgress = 0;
    let totalBudget = 0;
    let criticalProjects = 0;

    this.projects.forEach(p => {
      totalTasks += p.taskCount || 0;
      sumProgress += p.progress || 0;
      totalBudget += p.totalCost || 0;
      if (p.criticalCount > 0) criticalProjects++;
    });

    const avgProgress = totalProjects > 0 ? Math.round(sumProgress / totalProjects) : 0;
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
    };

    let html = `
      <div class="portfolio-view-wrapper">
        <!-- Cabeçalho Executivo de Portfólio -->
        <div class="portfolio-header">
          <div class="portfolio-title-area">
            <h2>📁 Portfólio & Gerenciamento Multi-Projetos</h2>
            <p>Visão integrada de programas, progresso físico consolidado e governança de projetos.</p>
          </div>
          <div class="portfolio-actions-area">
            <button class="btn-action-primary" id="btnPortfolioNew">
              <span>➕</span> <span>Novo Projeto</span>
            </button>
            <button class="btn-action-secondary" id="btnPortfolioBackup" title="Exportar backup completo de todos os projetos em arquivo único">
              <span>📦</span> <span>Exportar Portfólio (JSON)</span>
            </button>
          </div>
        </div>

        <!-- Cards de KPIs do Portfólio -->
        <div class="portfolio-kpi-grid">
          <div class="portfolio-kpi-card">
            <div class="kpi-icon">📁</div>
            <div class="kpi-data">
              <span class="kpi-val">${totalProjects}</span>
              <span class="kpi-label">Projetos Ativos</span>
            </div>
          </div>
          <div class="portfolio-kpi-card highlight-progress">
            <div class="kpi-icon">📈</div>
            <div class="kpi-data">
              <span class="kpi-val">${avgProgress}%</span>
              <span class="kpi-label">Avanço Médio Consolidado</span>
            </div>
          </div>
          <div class="portfolio-kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-data">
              <span class="kpi-val">${formatCurrency(totalBudget)}</span>
              <span class="kpi-label">Orçamento Global Estimado</span>
            </div>
          </div>
          <div class="portfolio-kpi-card">
            <div class="kpi-icon">📋</div>
            <div class="kpi-data">
              <span class="kpi-val">${totalTasks}</span>
              <span class="kpi-label">Total de Tarefas</span>
            </div>
          </div>
          <div class="portfolio-kpi-card ${criticalProjects > 0 ? 'alert-critical' : ''}">
            <div class="kpi-icon">🔥</div>
            <div class="kpi-data">
              <span class="kpi-val">${criticalProjects}</span>
              <span class="kpi-label">Com Caminho Crítico</span>
            </div>
          </div>
        </div>

        <!-- Grade de Projetos do Portfólio -->
        <div class="portfolio-section">
          <div class="section-subhead">
            <h3>Seus Projetos</h3>
            <span class="badge-count">${this.projects.length} cadastrados</span>
          </div>

          <div class="portfolio-cards-grid">
            ${this.renderProjectCards()}
          </div>
        </div>

        <!-- Master Gantt / Roadmap Consolidado de Projetos -->
        <div class="portfolio-section" style="margin-top: 24px;">
          <div class="section-subhead">
            <h3>🗺️ Master Gantt — Linha do Tempo Comparativa do Portfólio</h3>
            <span class="badge-sub">Visão consolidada multi-projetos</span>
          </div>
          <div class="master-gantt-container" id="masterGanttContainer">
            ${this.renderMasterGantt()}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindViewEvents();
  },

  renderProjectCards() {
    if (this.projects.length === 0) {
      return `
        <div class="portfolio-empty">
          <p>Nenhum projeto encontrado. Clique em "+ Novo Projeto" para começar.</p>
        </div>
      `;
    }

    return this.projects.map(p => {
      const isCurrent = p.id === this.currentProjectId;
      const statusLabels = {
        planning: 'Planejamento',
        in_progress: 'Em Andamento',
        completed: 'Concluído',
        on_hold: 'Em Espera'
      };
      const statusClasses = {
        planning: 'status-planning',
        in_progress: 'status-progress',
        completed: 'status-completed',
        on_hold: 'status-hold'
      };

      const statusText = statusLabels[p.status] || 'Em Andamento';
      const statusClass = statusClasses[p.status] || 'status-progress';

      return `
        <div class="portfolio-card ${isCurrent ? 'is-active-project' : ''}" data-id="${p.id}">
          <div class="p-card-top">
            <div class="p-card-header">
              <span class="p-card-status ${statusClass}">${statusText}</span>
              ${isCurrent ? '<span class="p-badge-current">● Ativo no Editor</span>' : ''}
            </div>
            <h4 class="p-card-title" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</h4>
          </div>

          <div class="p-card-progress">
            <div class="p-prog-bar-wrap">
              <div class="p-prog-bar-fill" style="width: ${p.progress}%;"></div>
            </div>
            <div class="p-prog-meta">
              <span>Progresso</span>
              <strong>${p.progress}%</strong>
            </div>
          </div>

          <div class="p-card-details">
            <div class="p-detail-item">
              <span class="detail-label">Início / Fim:</span>
              <span class="detail-val">${ProjectEngine.formatDisplayDate(p.startDate)} → ${ProjectEngine.formatDisplayDate(p.endDate)}</span>
            </div>
            <div class="p-detail-item">
              <span class="detail-label">Tarefas:</span>
              <span class="detail-val">${p.taskCount} itens</span>
            </div>
            ${p.totalCost ? `
            <div class="p-detail-item">
              <span class="detail-label">Orçamento:</span>
              <span class="detail-val">R$ ${p.totalCost.toLocaleString('pt-BR')}</span>
            </div>` : ''}
          </div>

          <div class="p-card-actions">
            <button class="btn-card-open" data-act="open" data-id="${p.id}" title="Carregar projeto no editor">
              <span>📂 Abrir</span>
            </button>
            <button class="btn-card-icon" data-act="duplicate" data-id="${p.id}" title="Duplicar / Clonar Projeto">
              <span>📄</span>
            </button>
            <button class="btn-card-icon" data-act="share" data-id="${p.id}" title="Gerar link de compartilhamento em nuvem">
              <span>☁️</span>
            </button>
            <button class="btn-card-icon" data-act="rename" data-id="${p.id}" title="Renomear Projeto">
              <span>✏️</span>
            </button>
            <button class="btn-card-icon danger" data-act="delete" data-id="${p.id}" title="Excluir Projeto">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Renderiza a linha do tempo Master Gantt consolidada
  renderMasterGantt() {
    if (this.projects.length === 0) return '';

    // Encontra o menor início e maior término global
    let minDate = '9999-12-31';
    let maxDate = '0000-00-00';

    this.projects.forEach(p => {
      if (p.startDate && p.startDate < minDate) minDate = p.startDate;
      if (p.endDate && p.endDate > maxDate) maxDate = p.endDate;
    });

    if (minDate === '9999-12-31') minDate = ProjectEngine.formatDate(new Date());
    if (maxDate === '0000-00-00') maxDate = ProjectEngine.addWorkDays(minDate, 30);

    const totalDays = Math.max(15, ProjectEngine.diffDays(minDate, maxDate) + 5);

    // Renderiza cada projeto como uma barra contínua no tempo
    const rowsHtml = this.projects.map(p => {
      const startOffset = Math.max(0, ProjectEngine.diffDays(minDate, p.startDate || minDate));
      const duration = Math.max(2, ProjectEngine.diffDays(p.startDate || minDate, p.endDate || minDate));
      
      const leftPct = (startOffset / totalDays) * 100;
      const widthPct = Math.min(100 - leftPct, Math.max(2, (duration / totalDays) * 100));

      const isCurrent = p.id === this.currentProjectId;

      return `
        <div class="master-row ${isCurrent ? 'active-proj' : ''}" data-id="${p.id}">
          <div class="master-row-label">
            <span class="m-proj-name" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</span>
            <span class="m-proj-dates">${ProjectEngine.formatDisplayDate(p.startDate)} - ${ProjectEngine.formatDisplayDate(p.endDate)}</span>
          </div>
          <div class="master-row-track">
            <div class="master-bar" style="left: ${leftPct}%; width: ${widthPct}%;" title="${this.escapeHtml(p.name)} (${p.progress}%)">
              <div class="master-bar-fill" style="width: ${p.progress}%;"></div>
              <span class="master-bar-text">${p.progress}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="master-gantt-board">
        <div class="master-timeline-header">
          <div class="master-hdr-label">Projeto</div>
          <div class="master-hdr-track">
            <span>${ProjectEngine.formatDisplayDate(minDate)}</span>
            <span class="track-center">Período Global Consolidado (~${totalDays} dias)</span>
            <span>${ProjectEngine.formatDisplayDate(maxDate)}</span>
          </div>
        </div>
        <div class="master-rows-body">
          ${rowsHtml}
        </div>
      </div>
    `;
  },

  bindViewEvents() {
    if (!this.container) return;

    // Novo Projeto
    const btnNew = this.container.querySelector('#btnPortfolioNew');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.promptNewProject());
    }

    // Exportar Backup
    const btnBackup = this.container.querySelector('#btnPortfolioBackup');
    if (btnBackup) {
      btnBackup.addEventListener('click', () => this.exportPortfolioBundle());
    }

    // Ações dos Cards
    this.container.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.getAttribute('data-act');
        const id = btn.getAttribute('data-id');

        switch (act) {
          case 'open':
            this.switchProject(id);
            break;
          case 'duplicate':
            this.duplicateProject(id);
            break;
          case 'share':
            this.switchProject(id);
            if (window.CloudShare) window.CloudShare.openModal();
            break;
          case 'rename':
            const currentProj = this.projects.find(p => p.id === id);
            const newName = prompt('Novo nome para o projeto:', currentProj ? currentProj.name : '');
            if (newName && newName.trim()) {
              this.renameProject(id, newName.trim());
            }
            break;
          case 'delete':
            this.deleteProject(id);
            break;
        }
      });
    });

    // Clicar na barra do Master Gantt também abre o projeto
    this.container.querySelectorAll('.master-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        if (id) this.switchProject(id);
      });
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.PortfolioManager = PortfolioManager;
