/**
 * ProjectClone - Dicionário de Internacionalização (PT-BR / EN-US)
 */
const I18N = {
  currentLang: 'pt',

  dict: {
    pt: {
      appName: 'ProjectClone',
      appSubtitle: 'Gestão Profissional de Projetos & Gantt',
      
      // Ribbon Tabs
      tabFile: 'Arquivo',
      tabTask: 'Tarefa',
      tabResources: 'Recursos',
      tabView: 'Exibir',
      tabProject: 'Projeto',
      
      // File Actions
      actNew: 'Novo',
      actOpen: 'Abrir',
      actSave: 'Salvar',
      actSaveAs: 'Salvar Como',
      actTemplates: 'Modelos',
      actExportPdf: 'Exportar PDF',
      actExportXml: 'MS Project (XML)',
      actImportXml: 'Importar XML',
      actExportExcel: 'Excel (CSV)',
      actAbout: 'Sobre',

      // Task Actions
      actAddTask: 'Nova Tarefa',
      actAddMilestone: 'Novo Marco',
      actAddSummary: 'Nova Fase',
      actDeleteTask: 'Excluir',
      actIndent: 'Recuar (Subtarefa)',
      actOutdent: 'Avançar Nível',
      actLink: 'Vincular (FS)',
      actUnlink: 'Desvincular',
      actComplete100: 'Concluir 100%',
      actProperties: 'Propriedades',
      actMoveUp: 'Mover p/ Cima',
      actMoveDown: 'Mover p/ Baixo',

      // View Modes
      viewGantt: 'Gráfico de Gantt',
      viewKanban: 'Quadro Kanban',
      viewResources: 'Folha de Recursos',
      viewDashboard: 'Painel & KPIs',
      viewCalendar: 'Calendário',

      // Zoom Options
      zoomDays: 'Dias',
      zoomWeeks: 'Semanas',
      zoomMonths: 'Meses',
      zoomQuarters: 'Trimestres',

      // Project Actions
      actCriticalPath: 'Caminho Crítico',
      actSaveBaseline: 'Salvar Linha de Base',
      actShowBaseline: 'Exibir Linha de Base',
      actProjectInfo: 'Informações do Projeto',
      actRecalculate: 'Recalcular',

      // WBS Columns
      colIndicator: 'Status',
      colId: 'ID',
      colWbs: 'EAP / WBS',
      colName: 'Nome da Tarefa',
      colDuration: 'Duração',
      colStart: 'Início',
      colEnd: 'Término',
      colPredecessors: 'Predecessoras',
      colProgress: '% Concluído',
      colResources: 'Recursos',
      colCost: 'Custo Est.',
      
      // Units
      daysSuffix: 'dias',
      daySuffix: 'dia',
      hrsSuffix: 'h',

      // Status
      statusNotStarted: 'Não Iniciado',
      statusInProgress: 'Em Andamento',
      statusCompleted: 'Concluído',
      statusLate: 'Atrasado',
      statusCritical: 'Crítico',
      statusMilestone: 'Marco',

      // Kanban Columns
      kbBacklog: 'Backlog / Planejado',
      kbTodo: 'A Fazer (0%)',
      kbInProgress: 'Em Andamento (1-99%)',
      kbDone: 'Concluído (100%)',

      // Resources
      resName: 'Nome do Recurso',
      resRole: 'Função / Cargo',
      resRate: 'Taxa Padrão (R$/h)',
      resType: 'Tipo',
      resTasksCount: 'Tarefas Atribuídas',
      resTotalCost: 'Custo Total Estimado',
      resAdd: 'Adicionar Recurso',
      resWork: 'Trabalho',
      resMaterial: 'Material',

      // Dashboard
      kpiTotalTasks: 'Total de Tarefas',
      kpiCompletedTasks: 'Tarefas Concluídas',
      kpiInProgressTasks: 'Em Andamento',
      kpiDelayedTasks: 'Tarefas Atrasadas',
      kpiOverallProgress: 'Progresso Físico Geral',
      kpiTotalCost: 'Custo Orçado Total',
      kpiProjectEnd: 'Previsão de Término',
      kpiCriticalTasks: 'Tarefas no Caminho Crítico',
      chartProgressTitle: 'Curva de Conclusão de Tarefas',
      chartCostTitle: 'Distribuição de Recursos e Custos',

      // Modals & Prompts
      modalTaskTitle: 'Detalhes da Tarefa',
      modalResourceTitle: 'Detalhes do Recurso',
      modalProjectTitle: 'Configurações do Projeto',
      modalTemplatesTitle: 'Escolha um Modelo Profissional',
      modalAboutTitle: 'Sobre o ProjectClone',
      btnCancel: 'Cancelar',
      btnConfirm: 'Confirmar',
      btnSave: 'Salvar',
      btnClose: 'Fechar',
      btnApply: 'Aplicar',
      btnDownload: 'Baixar Arquivo',

      // Notifications
      msgSavedSuccess: 'Projeto salvo com sucesso no navegador!',
      msgBaselineSaved: 'Linha de base salva! Agora você pode comparar desvios de cronograma.',
      msgXmlExported: 'Arquivo XML compatível com Microsoft Project gerado!',
      msgXmlImported: 'Projeto do MS Project carregado com sucesso!',
      msgTaskAdded: 'Nova tarefa adicionada.',
      msgTaskDeleted: 'Tarefa removida.',
      msgTaskLinked: 'Tarefas vinculadas.',
      msgTemplateLoaded: 'Modelo carregado com sucesso!',

      // Tooltips & Helpers
      tipDragToMove: 'Arraste para mover as datas',
      tipDragToResize: 'Arraste as extremidades para alterar a duração',
      tipDragProgress: 'Arraste a barra interna para atualizar o %',
      tipMilestoneDiamond: 'Marco de entrega (Duração zero)'
    },

    en: {
      appName: 'ProjectClone',
      appSubtitle: 'Professional Project Management & Gantt',

      // Ribbon Tabs
      tabFile: 'File',
      tabTask: 'Task',
      tabResources: 'Resources',
      tabView: 'View',
      tabProject: 'Project',

      // File Actions
      actNew: 'New',
      actOpen: 'Open',
      actSave: 'Save',
      actSaveAs: 'Save As',
      actTemplates: 'Templates',
      actExportPdf: 'Export PDF',
      actExportXml: 'MS Project (XML)',
      actImportXml: 'Import XML',
      actExportExcel: 'Excel (CSV)',
      actAbout: 'About',

      // Task Actions
      actAddTask: 'New Task',
      actAddMilestone: 'New Milestone',
      actAddSummary: 'New Phase',
      actDeleteTask: 'Delete',
      actIndent: 'Indent (Subtask)',
      actOutdent: 'Outdent',
      actLink: 'Link (FS)',
      actUnlink: 'Unlink',
      actComplete100: 'Complete 100%',
      actProperties: 'Properties',
      actMoveUp: 'Move Up',
      actMoveDown: 'Move Down',

      // View Modes
      viewGantt: 'Gantt Chart',
      viewKanban: 'Kanban Board',
      viewResources: 'Resource Sheet',
      viewDashboard: 'Dashboard & KPIs',
      viewCalendar: 'Calendar',

      // Zoom Options
      zoomDays: 'Days',
      zoomWeeks: 'Weeks',
      zoomMonths: 'Months',
      zoomQuarters: 'Quarters',

      // Project Actions
      actCriticalPath: 'Critical Path',
      actSaveBaseline: 'Save Baseline',
      actShowBaseline: 'Show Baseline',
      actProjectInfo: 'Project Information',
      actRecalculate: 'Recalculate',

      // WBS Columns
      colIndicator: 'Status',
      colId: 'ID',
      colWbs: 'WBS',
      colName: 'Task Name',
      colDuration: 'Duration',
      colStart: 'Start',
      colEnd: 'Finish',
      colPredecessors: 'Predecessors',
      colProgress: '% Complete',
      colResources: 'Resources',
      colCost: 'Est. Cost',

      // Units
      daysSuffix: 'days',
      daySuffix: 'day',
      hrsSuffix: 'h',

      // Status
      statusNotStarted: 'Not Started',
      statusInProgress: 'In Progress',
      statusCompleted: 'Completed',
      statusLate: 'Late',
      statusCritical: 'Critical',
      statusMilestone: 'Milestone',

      // Kanban Columns
      kbBacklog: 'Backlog / Planned',
      kbTodo: 'To Do (0%)',
      kbInProgress: 'In Progress (1-99%)',
      kbDone: 'Done (100%)',

      // Resources
      resName: 'Resource Name',
      resRole: 'Role / Title',
      resRate: 'Standard Rate ($/h)',
      resType: 'Type',
      resTasksCount: 'Assigned Tasks',
      resTotalCost: 'Est. Total Cost',
      resAdd: 'Add Resource',
      resWork: 'Work',
      resMaterial: 'Material',

      // Dashboard
      kpiTotalTasks: 'Total Tasks',
      kpiCompletedTasks: 'Completed Tasks',
      kpiInProgressTasks: 'In Progress',
      kpiDelayedTasks: 'Late Tasks',
      kpiOverallProgress: 'Overall Physical Progress',
      kpiTotalCost: 'Total Budgeted Cost',
      kpiProjectEnd: 'Target Finish Date',
      kpiCriticalTasks: 'Critical Path Tasks',
      chartProgressTitle: 'Task Completion Progress',
      chartCostTitle: 'Resource & Cost Distribution',

      // Modals & Prompts
      modalTaskTitle: 'Task Details',
      modalResourceTitle: 'Resource Details',
      modalProjectTitle: 'Project Settings',
      modalTemplatesTitle: 'Choose a Professional Template',
      modalAboutTitle: 'About ProjectClone',
      btnCancel: 'Cancel',
      btnConfirm: 'Confirm',
      btnSave: 'Save',
      btnClose: 'Close',
      btnApply: 'Apply',
      btnDownload: 'Download File',

      // Notifications
      msgSavedSuccess: 'Project saved successfully in browser!',
      msgBaselineSaved: 'Baseline saved! You can now track schedule variance.',
      msgXmlExported: 'Microsoft Project compatible XML generated!',
      msgXmlImported: 'MS Project file successfully loaded!',
      msgTaskAdded: 'New task added.',
      msgTaskDeleted: 'Task removed.',
      msgTaskLinked: 'Tasks linked.',
      msgTemplateLoaded: 'Template successfully loaded!',

      // Tooltips & Helpers
      tipDragToMove: 'Drag to move dates',
      tipDragToResize: 'Drag edges to change duration',
      tipDragProgress: 'Drag inner bar to adjust %',
      tipMilestoneDiamond: 'Milestone delivery (Zero duration)'
    }
  },

  init() {
    const saved = localStorage.getItem('projectclone_lang');
    if (saved && (saved === 'pt' || saved === 'en')) {
      this.currentLang = saved;
    } else {
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      this.currentLang = navLang.startsWith('pt') ? 'pt' : 'en';
    }
  },

  setLang(lang) {
    if (lang !== 'pt' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem('projectclone_lang', lang);
    this.applyAll();
  },

  t(key) {
    const table = this.dict[this.currentLang] || this.dict.pt;
    return table[key] || key;
  },

  applyAll() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder) el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // Atualiza botões de idioma ativos na barra
    const btnPt = document.getElementById('btnLangPt');
    const btnEn = document.getElementById('btnLangEn');
    if (btnPt && btnEn) {
      if (this.currentLang === 'pt') {
        btnPt.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnPt.classList.remove('active');
      }
    }

    if (window.State && window.State.eventBus) {
      window.State.eventBus.emit('langChanged', this.currentLang);
    }
  }
};

window.I18N = I18N;
