/**
 * ProjectClone - Controlador Principal da Aplicação
 */

const App = {
  activeModal: null,

  init() {
    // 1. Inicializar Internacionalização e Estado
    I18N.init();
    State.init();

    // 2. Inicializar Módulos de Interface
    WBSGrid.init('wbsPane');
    GanttChart.init('ganttPane');
    KanbanView.init('kanbanContainer');
    ResourcesView.init('resourcesContainer');
    DashboardView.init('dashboardContainer');
    CalendarView.init('calendarContainer');
    if (window.CurvaSEvaView) window.CurvaSEvaView.init('curvaSContainer');
    if (window.AIAssistant) window.AIAssistant.init();

    // 3. Vincular Eventos Globais, Menus e Modais
    this.bindRibbon();
    this.bindSplitter();
    this.bindKeyboardShortcuts();
    this.bindModals();
    this.bindTheme();
    this.bindLanguageSwitcher();

    // 4. Render inicial da view atual
    this.switchView(State.project.view || 'gantt');
    I18N.applyAll();

    // 5. Registrar Service Worker PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('[PWA] Service Worker ativo'))
        .catch(err => console.warn('[PWA] Erro ao registrar SW:', err));
    }
  },

  // 1. Ribbon Menu (Abas e Ações)
  bindRibbon() {
    const tabs = document.querySelectorAll('.ribbon-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetPanel = tab.getAttribute('data-tab');
        document.querySelectorAll('.ribbon-panel').forEach(panel => {
          panel.classList.toggle('active', panel.getAttribute('data-panel') === targetPanel);
        });
      });
    });

    // Ações de Botões do Ribbon
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const act = btn.getAttribute('data-action');
      this.handleAction(act, btn);
    });

    // Alternador de Visualização (Gantt, Kanban, Recursos, Dashboard, Calendário)
    document.querySelectorAll('.view-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Seletor de Zoom
    const zoomSelect = document.getElementById('selectZoom');
    if (zoomSelect) {
      zoomSelect.value = State.project.zoom || 'week';
      zoomSelect.addEventListener('change', () => {
        State.setZoom(zoomSelect.value);
      });
    }

    // Toggle Caminho Crítico
    const chkCritical = document.getElementById('chkCriticalPath');
    if (chkCritical) {
      chkCritical.checked = State.project.showCriticalPath;
      chkCritical.addEventListener('change', () => {
        State.project.showCriticalPath = chkCritical.checked;
        State.eventBus.emit('displayOptionsChanged', State.project);
      });
    }

    // Toggle Linha de Base
    const chkBaseline = document.getElementById('chkBaseline');
    if (chkBaseline) {
      chkBaseline.checked = State.project.showBaseline;
      chkBaseline.addEventListener('change', () => {
        State.project.showBaseline = chkBaseline.checked;
        State.eventBus.emit('displayOptionsChanged', State.project);
      });
    }

    // Toggle Mini-Mapa Panorâmico
    const chkMinimap = document.getElementById('chkMinimap');
    if (chkMinimap) {
      chkMinimap.checked = State.project.showMinimap !== false;
      chkMinimap.addEventListener('change', () => {
        State.project.showMinimap = chkMinimap.checked;
        if (window.GanttChart) window.GanttChart.render();
      });
    }
  },

  handleAction(action, btnEl) {
    switch (action) {
      // Arquivo
      case 'newProject':
        if (confirm('Deseja iniciar um novo projeto?')) State.newProject();
        break;
      case 'openProject':
        document.getElementById('fileInputJson').click();
        break;
      case 'saveProject':
        State.saveToStorage();
        this.showToast(I18N.t('msgSavedSuccess'));
        break;
      case 'exportJson':
        ProjectIO.exportJson();
        break;
      case 'openTemplates':
        this.openModal('modalTemplates');
        break;
      case 'openAiGenerate':
        this.openModal('modalAiGenerate');
        break;
      case 'openAiAudit':
        this.openModal('modalAiAudit');
        break;
      case 'openAiReport':
        this.openModal('modalAiReport');
        break;
      case 'openAiOptimize':
        this.openModal('modalAiOptimize');
        break;
      case 'exportXml':
        ProjectIO.exportMsProjectXml();
        break;
      case 'importXml':
        document.getElementById('fileInputXml').click();
        break;
      case 'exportCsv':
        ProjectIO.exportCsv();
        break;
      case 'exportPdf':
        window.print();
        break;
      case 'exportPng':
        ProjectIO.exportHighResPng();
        break;
      case 'about':
        this.openModal('modalAbout');
        break;

      // Tarefas
      case 'addTask':
        State.addTask({}, State.selectedTaskId);
        break;
      case 'addMilestone':
        State.addMilestone(State.selectedTaskId);
        break;
      case 'addSummary':
        State.addSummary(State.selectedTaskId);
        break;
      case 'deleteTask':
        if (State.selectedTaskId) {
          if (confirm(I18N.t('actDeleteTask') + '?')) State.deleteTask(State.selectedTaskId);
        } else {
          alert('Selecione uma tarefa primeiro.');
        }
        break;
      case 'indent':
        if (State.selectedTaskId) State.indentTask(State.selectedTaskId);
        break;
      case 'outdent':
        if (State.selectedTaskId) State.outdentTask(State.selectedTaskId);
        break;
      case 'complete100':
        if (State.selectedTaskId) State.updateTask(State.selectedTaskId, { progress: 100 });
        break;
      case 'properties':
        if (State.selectedTaskId) this.openTaskModal(State.selectedTaskId);
        break;
      case 'moveUp':
        if (State.selectedTaskId) State.moveTask(State.selectedTaskId, 'up');
        break;
      case 'moveDown':
        if (State.selectedTaskId) State.moveTask(State.selectedTaskId, 'down');
        break;

      // Projeto
      case 'saveBaseline':
        State.saveBaseline();
        this.showToast(I18N.t('msgBaselineSaved'));
        break;
      case 'projectInfo':
        this.openProjectSettingsModal();
        break;
      case 'calendarSettings':
        this.openCalendarSettingsModal();
        break;
      case 'recalculate':
        State.recalculateAndSave();
        this.showToast('Cronograma recalculado.');
        break;

      // Equipe & Nivelamento
      case 'levelResources':
        this.switchView('resources');
        if (window.ResourcesView) {
          ResourcesView.currentSubTab = 'workload';
          ResourcesView.executeLeveling();
        }
        break;
      case 'clearLeveling':
        this.switchView('resources');
        if (window.ResourcesView) {
          ResourcesView.clearLeveling();
        }
        break;
      case 'openWorkload':
        this.switchView('resources');
        if (window.ResourcesView) {
          ResourcesView.currentSubTab = 'workload';
          ResourcesView.render();
        }
        break;
      case 'openResourceSheet':
        this.switchView('resources');
        if (window.ResourcesView) {
          ResourcesView.currentSubTab = 'sheet';
          ResourcesView.render();
        }
        break;
      case 'addResource':
        this.switchView('resources');
        if (window.ResourcesView) {
          ResourcesView.openAddPrompt();
        }
        break;

      // Desfazer / Refazer
      case 'undo':
        if (State.undo()) this.showToast('Ação desfeita (Undo)');
        break;
      case 'redo':
        if (State.redo()) this.showToast('Ação refeita (Redo)');
        break;
    }
  },

  // 2. Alternar Modos de Visualização
  switchView(viewName) {
    State.setView(viewName);

    // Atualiza botões da barra
    document.querySelectorAll('.view-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    const splitView = document.getElementById('splitView');
    const kanbanView = document.getElementById('kanbanContainer');
    const resourcesView = document.getElementById('resourcesContainer');
    const dashboardView = document.getElementById('dashboardContainer');
    const calendarView = document.getElementById('calendarContainer');
    const curvaSView = document.getElementById('curvaSContainer');

    splitView.style.display = 'none';
    kanbanView.style.display = 'none';
    resourcesView.style.display = 'none';
    dashboardView.style.display = 'none';
    calendarView.style.display = 'none';
    if (curvaSView) curvaSView.style.display = 'none';

    if (viewName === 'gantt') {
      splitView.style.display = 'flex';
      WBSGrid.render();
      GanttChart.render();
    } else if (viewName === 'kanban') {
      kanbanView.style.display = 'block';
      KanbanView.render();
    } else if (viewName === 'resources') {
      resourcesView.style.display = 'block';
      ResourcesView.render();
    } else if (viewName === 'dashboard') {
      dashboardView.style.display = 'block';
      DashboardView.render();
    } else if (viewName === 'calendar') {
      calendarView.style.display = 'block';
      CalendarView.render();
    } else if (viewName === 'curvaS') {
      if (curvaSView) {
        curvaSView.style.display = 'block';
        CurvaSEvaView.render();
      }
    }
  },

  // 3. Divisor Redimensionável (Splitter)
  bindSplitter() {
    const handle = document.getElementById('splitHandle');
    const wbsPane = document.getElementById('wbsPane');
    if (!handle || !wbsPane) return;

    // Restaurar largura salva
    const savedW = localStorage.getItem('projectclone_wbs_width');
    if (savedW) {
      wbsPane.style.width = `${savedW}px`;
    }

    let isResizing = false;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(280, Math.min(window.innerWidth - 300, e.clientX));
      wbsPane.style.width = `${newWidth}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('projectclone_wbs_width', parseInt(wbsPane.style.width, 10));
      }
    });
  },

  // 4. Atalhos de Teclado
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignorar se estiver digitando em input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // Ctrl + S (Salvar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        State.saveToStorage();
        this.showToast(I18N.t('msgSavedSuccess'));
        return;
      }

      // Ctrl + Z (Desfazer)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (State.undo()) this.showToast('Desfeito (Undo)');
        return;
      }

      // Ctrl + Y ou Ctrl + Shift + Z (Refazer)
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        if (State.redo()) this.showToast('Refeito (Redo)');
        return;
      }

      // Insert (Nova Tarefa)
      if (e.key === 'Insert') {
        e.preventDefault();
        State.addTask({}, State.selectedTaskId);
        return;
      }

      // Delete (Excluir Tarefa)
      if (e.key === 'Delete') {
        if (State.selectedTaskId && confirm(I18N.t('actDeleteTask') + '?')) {
          State.deleteTask(State.selectedTaskId);
        }
        return;
      }

      // Alt + Shift + Right (Indent)
      if (e.altKey && e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (State.selectedTaskId) State.indentTask(State.selectedTaskId);
        return;
      }

      // Alt + Shift + Left (Outdent)
      if (e.altKey && e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (State.selectedTaskId) State.outdentTask(State.selectedTaskId);
        return;
      }
    });
  },

  // 5. Modais
  bindModals() {
    // Fechar modais ao clicar no X ou fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.btn-modal-close') || e.target.closest('.btn-modal-cancel')) {
          this.closeAllModals();
        }
      });
    });

    // Inputs de Arquivo
    const fileXml = document.getElementById('fileInputXml');
    if (fileXml) {
      fileXml.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          ProjectIO.importMsProjectXml(event.target.result);
          fileXml.value = '';
        };
        reader.readAsText(file);
      });
    }

    const fileJson = document.getElementById('fileInputJson');
    if (fileJson) {
      fileJson.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          ProjectIO.importJson(event.target.result);
          fileJson.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Formulário de Propriedades da Tarefa
    const formTask = document.getElementById('formTaskDetails');
    if (formTask) {
      formTask.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('taskPropId').value, 10);
        const name = document.getElementById('taskPropName').value.trim();
        const duration = parseInt(document.getElementById('taskPropDuration').value, 10) || 0;
        const start = document.getElementById('taskPropStart').value;
        const end = document.getElementById('taskPropEnd').value;
        const progress = parseInt(document.getElementById('taskPropProgress').value, 10) || 0;
        const predecessors = document.getElementById('taskPropPreds').value.trim();
        const notes = document.getElementById('taskPropNotes').value.trim();

        // Recursos selecionados
        const resourceIds = [];
        document.querySelectorAll('.chk-task-res:checked').forEach(chk => {
          resourceIds.push(parseInt(chk.value, 10));
        });

        const constraintType = document.getElementById('taskPropConstraintType')?.value || 'ASAP';
        const constraintDate = document.getElementById('taskPropConstraintDate')?.value || '';

        State.updateTask(id, {
          name,
          duration,
          start,
          end,
          progress,
          predecessors,
          constraintType,
          constraintDate,
          notes,
          resourceIds
        });

        this.closeAllModals();
        this.showToast('Tarefa atualizada.');
      });
    }

    // Formulário de Calendário de Trabalho
    const formCal = document.getElementById('formCalendarSettings');
    if (formCal) {
      formCal.addEventListener('submit', (e) => {
        e.preventDefault();
        const useNational = document.getElementById('calUseNationalHolidays')?.checked ?? true;
        const workDays = [];
        for (let d = 0; d <= 6; d++) {
          const chk = document.getElementById('calDay_' + d);
          if (chk && chk.checked) workDays.push(d);
        }
        State.project.calendarSettings = {
          useNationalHolidays: useNational,
          workDays: workDays.length ? workDays : [1, 2, 3, 4, 5],
          customHolidays: (State.project.calendarSettings && State.project.calendarSettings.customHolidays) || []
        };
        State.recalculateAndSave();
        this.closeAllModals();
        this.showToast('Calendário de trabalho atualizado.');
      });
    }

    // Modal de Modelos (Templates)
    document.querySelectorAll('.template-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-template');
        if (confirm('Carregar este modelo irá substituir o projeto atual. Continuar?')) {
          const tmpl = ProjectTemplates.getTemplate(key);
          State.loadProject(tmpl, true);
          this.closeAllModals();
          this.showToast(I18N.t('msgTemplateLoaded'));
        }
      });
    });

    // Salvar Configurações do Projeto
    const formProj = document.getElementById('formProjectSettings');
    if (formProj) {
      formProj.addEventListener('submit', (e) => {
        e.preventDefault();
        State.project.name = document.getElementById('cfgProjectName').value.trim() || 'Meu Projeto';
        State.project.currency = document.getElementById('cfgCurrency').value;
        State.saveToStorage();
        this.closeAllModals();
        this.updateHeaderTitle();
        this.showToast('Configurações do projeto salvas.');
      });
    }
  },

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modal;
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.activeModal = null;
  },

  openTaskModal(taskId) {
    const task = State.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('taskPropId').value = task.id;
    document.getElementById('taskPropWbs').textContent = task.wbs || task.id;
    document.getElementById('taskPropName').value = task.name || '';
    document.getElementById('taskPropDuration').value = task.duration || 0;
    document.getElementById('taskPropStart').value = task.start || '';
    document.getElementById('taskPropEnd').value = task.end || '';
    document.getElementById('taskPropProgress').value = task.progress || 0;
    document.getElementById('taskPropPreds').value = task.predecessors || '';
    document.getElementById('taskPropNotes').value = task.notes || '';

    if (document.getElementById('taskPropConstraintType')) {
      document.getElementById('taskPropConstraintType').value = task.constraintType || 'ASAP';
    }
    if (document.getElementById('taskPropConstraintDate')) {
      document.getElementById('taskPropConstraintDate').value = task.constraintDate || '';
    }

    // Lista de Recursos disponíveis
    const resContainer = document.getElementById('taskResList');
    if (resContainer) {
      const assigned = task.resourceIds || [];
      const resHtml = (State.resources || []).map(r => `
        <label class="res-check-item">
          <input type="checkbox" class="chk-task-res" value="${r.id}" ${assigned.includes(r.id) ? 'checked' : ''}>
          <span>${r.name} (${r.role})</span>
        </label>
      `).join('');
      resContainer.innerHTML = resHtml || '<span class="text-muted">Nenhum recurso cadastrado.</span>';
    }

    this.openModal('modalTaskDetails');
  },

  openCalendarSettingsModal() {
    const cal = State.project.calendarSettings || {
      useNationalHolidays: true,
      workDays: [1, 2, 3, 4, 5],
      customHolidays: []
    };
    const chkHolidays = document.getElementById('calUseNationalHolidays');
    if (chkHolidays) chkHolidays.checked = !!cal.useNationalHolidays;

    for (let d = 0; d <= 6; d++) {
      const chk = document.getElementById('calDay_' + d);
      if (chk) chk.checked = (cal.workDays || [1, 2, 3, 4, 5]).includes(d);
    }
    this.openModal('modalCalendarSettings');
  },

  openProjectSettingsModal() {
    document.getElementById('cfgProjectName').value = State.project.name || '';
    document.getElementById('cfgCurrency').value = State.project.currency || 'BRL';
    this.openModal('modalProjectSettings');
  },

  updateHeaderTitle() {
    const el = document.getElementById('topProjectTitle');
    if (el) el.textContent = State.project.name;
  },

  // 6. Tema Dark / Light
  bindTheme() {
    const btnToggle = document.getElementById('btnThemeToggle');
    const saved = localStorage.getItem('projectclone_theme') || 'dark';

    document.body.classList.toggle('light-theme', saved === 'light');
    if (btnToggle) {
      btnToggle.textContent = saved === 'light' ? '🌙' : '☀️';
      btnToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('projectclone_theme', isLight ? 'light' : 'dark');
        btnToggle.textContent = isLight ? '🌙' : '☀️';
      });
    }
  },

  // 7. Idioma PT / EN
  bindLanguageSwitcher() {
    const btnPt = document.getElementById('btnLangPt');
    const btnEn = document.getElementById('btnLangEn');

    if (btnPt) btnPt.addEventListener('click', () => I18N.setLang('pt'));
    if (btnEn) btnEn.addEventListener('click', () => I18N.setLang('en'));
  },

  // Notificações Toast
  showToast(message, duration = 3000) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
};

window.App = App;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
