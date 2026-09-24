/**
 * ProjectClone - Gestão de Estado Central (State Management, Undo/Redo e Storage)
 */

class SimpleEventBus {
  constructor() {
    this.events = {};
  }
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => {
      try { cb(data); } catch (e) { console.error('Event error', event, e); }
    });
  }
}

const State = {
  eventBus: new SimpleEventBus(),

  project: {
    name: 'Projeto Residencial Horizonte',
    startDate: '',
    workDays: [1, 2, 3, 4, 5],
    hoursPerDay: 8,
    currency: 'BRL',
    baselineSaved: false,
    view: 'gantt', // 'gantt', 'kanban', 'resources', 'dashboard', 'calendar', 'curvaS'
    zoom: 'week',  // 'day', 'week', 'month', 'quarter'
    showCriticalPath: false,
    showBaseline: false,
    calendarSettings: {
      useNationalHolidays: true,
      workDays: [1, 2, 3, 4, 5],
      customHolidays: []
    }
  },

  tasks: [],
  resources: [],
  selectedTaskId: null,

  // Histórico para Undo / Redo
  undoStack: [],
  redoStack: [],
  maxHistory: 30,

  init() {
    const today = ProjectEngine.formatDate(new Date());
    this.project.startDate = today;

    // Tentar carregar do localStorage
    const saved = localStorage.getItem('projectclone_data_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tasks && parsed.tasks.length > 0) {
          this.loadProject(parsed, false);
          return;
        }
      } catch (e) {
        console.warn('Erro ao carregar dados salvos:', e);
      }
    }

    // Carregar modelo padrão se vazio
    if (window.ProjectTemplates) {
      const defaultTemplate = window.ProjectTemplates.getTemplate('construction');
      this.loadProject(defaultTemplate, false);
    }
  },

  pushHistory() {
    const snapshot = JSON.stringify({
      project: this.project,
      tasks: this.tasks,
      resources: this.resources
    });
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // limpa redo
  },

  undo() {
    if (!this.undoStack.length) return false;
    const current = JSON.stringify({
      project: this.project,
      tasks: this.tasks,
      resources: this.resources
    });
    this.redoStack.push(current);

    const prev = JSON.parse(this.undoStack.pop());
    this.loadProject(prev, false);
    return true;
  },

  redo() {
    if (!this.redoStack.length) return false;
    const next = JSON.parse(this.redoStack.pop());
    const current = JSON.stringify({
      project: this.project,
      tasks: this.tasks,
      resources: this.resources
    });
    this.undoStack.push(current);

    this.loadProject(next, false);
    return true;
  },

  recalculateAndSave() {
    ProjectEngine.recalculateAll({
      tasks: this.tasks,
      resources: this.resources
    });
    this.saveToStorage();
    this.eventBus.emit('tasksUpdated', this.tasks);
  },

  saveToStorage() {
    try {
      const data = {
        project: this.project,
        tasks: this.tasks,
        resources: this.resources
      };
      localStorage.setItem('projectclone_data_v1', JSON.stringify(data));
      this.eventBus.emit('saved', true);
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  },

  loadProject(data, pushHist = true) {
    if (pushHist) this.pushHistory();

    if (data.project) {
      this.project = Object.assign(this.project, data.project);
    }
    this.tasks = Array.isArray(data.tasks) ? JSON.parse(JSON.stringify(data.tasks)) : [];
    this.resources = Array.isArray(data.resources) ? JSON.parse(JSON.stringify(data.resources)) : [];
    this.selectedTaskId = null;

    ProjectEngine.recalculateAll({
      tasks: this.tasks,
      resources: this.resources
    });

    this.saveToStorage();
    this.eventBus.emit('projectLoaded', this.project);
    this.eventBus.emit('tasksUpdated', this.tasks);
    this.eventBus.emit('resourcesUpdated', this.resources);
  },

  newProject() {
    this.pushHistory();
    const today = ProjectEngine.formatDate(new Date());
    this.project.name = I18N.t('appName') + ' - ' + I18N.t('actNew');
    this.project.startDate = today;
    this.project.baselineSaved = false;

    this.tasks = [
      {
        id: 1,
        name: 'Fase Inicial',
        duration: 5,
        start: today,
        end: ProjectEngine.addWorkDays(today, 5),
        progress: 0,
        predecessors: '',
        resourceIds: [],
        level: 0,
        isSummary: true,
        collapsed: false,
        notes: ''
      },
      {
        id: 2,
        name: 'Planejamento e Reunião de Abertura',
        duration: 2,
        start: today,
        end: ProjectEngine.addWorkDays(today, 2),
        progress: 0,
        predecessors: '',
        resourceIds: [],
        level: 1,
        isSummary: false,
        notes: ''
      },
      {
        id: 3,
        name: 'Definição de Escopo e Prazos',
        duration: 3,
        start: ProjectEngine.addWorkDays(today, 3),
        end: ProjectEngine.addWorkDays(today, 5),
        progress: 0,
        predecessors: '2FS',
        resourceIds: [],
        level: 1,
        isSummary: false,
        notes: ''
      },
      {
        id: 4,
        name: 'Marco: Escopo Aprovado',
        duration: 0,
        start: ProjectEngine.addWorkDays(today, 5),
        end: ProjectEngine.addWorkDays(today, 5),
        progress: 0,
        predecessors: '3FS',
        resourceIds: [],
        level: 1,
        milestone: true,
        notes: ''
      }
    ];

    this.resources = [
      { id: 1, name: 'Gerente de Projetos', role: 'Gestor', standardRate: 150, type: 'work' },
      { id: 2, name: 'Engenheiro Responsável', role: 'Engenharia', standardRate: 180, type: 'work' }
    ];

    this.recalculateAndSave();
  },

  getNextId() {
    let max = 0;
    this.tasks.forEach(t => { if (t.id > max) max = t.id; });
    return max + 1;
  },

  addTask(data = {}, insertAfterId = null) {
    this.pushHistory();
    const nextId = this.getNextId();
    const today = this.project.startDate || ProjectEngine.formatDate(new Date());

    const newTask = Object.assign({
      id: nextId,
      name: I18N.t('actAddTask') + ' ' + nextId,
      duration: 3,
      start: today,
      end: ProjectEngine.addWorkDays(today, 3),
      progress: 0,
      predecessors: '',
      resourceIds: [],
      level: 0,
      isSummary: false,
      constraintType: 'ASAP',
      constraintDate: '',
      notes: ''
    }, data);

    if (insertAfterId !== null) {
      const idx = this.tasks.findIndex(t => t.id === insertAfterId);
      if (idx !== -1) {
        newTask.level = this.tasks[idx].level || 0;
        this.tasks.splice(idx + 1, 0, newTask);
      } else {
        this.tasks.push(newTask);
      }
    } else {
      this.tasks.push(newTask);
    }

    this.selectedTaskId = newTask.id;
    this.recalculateAndSave();
    return newTask;
  },

  addMilestone(insertAfterId = null) {
    const today = this.project.startDate || ProjectEngine.formatDate(new Date());
    return this.addTask({
      name: I18N.t('actAddMilestone'),
      duration: 0,
      milestone: true,
      start: today,
      end: today
    }, insertAfterId);
  },

  addSummary(insertAfterId = null) {
    return this.addTask({
      name: I18N.t('actAddSummary'),
      duration: 5,
      isSummary: true
    }, insertAfterId);
  },

  updateTask(taskId, changes = {}) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.pushHistory();
    Object.assign(task, changes);

    // Ajusta datas se duração mudou
    if ('duration' in changes && !task.isSummary) {
      const dur = Math.max(0, parseInt(changes.duration, 10) || 0);
      task.duration = dur;
      if (dur === 0) {
        task.milestone = true;
        task.end = task.start;
      } else {
        task.milestone = false;
        task.end = ProjectEngine.addWorkDays(task.start, dur);
      }
    }

    // Ajusta duração se datas mudaram diretamente
    if (('start' in changes || 'end' in changes) && !task.isSummary && !task.milestone) {
      if (task.start && task.end) {
        task.duration = ProjectEngine.countWorkDays(task.start, task.end);
      }
    }

    this.recalculateAndSave();
  },

  deleteTask(taskId) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    this.pushHistory();
    const removedId = this.tasks[idx].id;
    this.tasks.splice(idx, 1);

    // Limpar referências a esta tarefa em predecessoras
    this.tasks.forEach(t => {
      if (t.predecessors) {
        const preds = ProjectEngine.parsePredecessors(t.predecessors);
        const filtered = preds.filter(p => p.id !== removedId);
        t.predecessors = filtered.map(p => `${p.id}${p.type}${p.lag ? (p.lag > 0 ? '+' + p.lag : p.lag) : ''}`).join(', ');
      }
    });

    if (this.selectedTaskId === taskId) {
      this.selectedTaskId = null;
    }

    this.recalculateAndSave();
  },

  indentTask(taskId) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx <= 0) return; // Não pode identar o primeiro item da lista

    const prevTask = this.tasks[idx - 1];
    const task = this.tasks[idx];
    const maxLevel = (prevTask.level || 0) + 1;

    if ((task.level || 0) < maxLevel) {
      this.pushHistory();
      task.level = (task.level || 0) + 1;
      this.recalculateAndSave();
    }
  },

  outdentTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || (task.level || 0) <= 0) return;

    this.pushHistory();
    task.level = (task.level || 0) - 1;
    this.recalculateAndSave();
  },

  moveTask(taskId, direction) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      this.pushHistory();
      const temp = this.tasks[idx];
      this.tasks[idx] = this.tasks[idx - 1];
      this.tasks[idx - 1] = temp;
      this.recalculateAndSave();
    } else if (direction === 'down' && idx < this.tasks.length - 1) {
      this.pushHistory();
      const temp = this.tasks[idx];
      this.tasks[idx] = this.tasks[idx + 1];
      this.tasks[idx + 1] = temp;
      this.recalculateAndSave();
    }
  },

  linkTasks(fromId, toId, type = 'FS') {
    if (fromId === toId) return;
    const target = this.tasks.find(t => t.id === toId);
    if (!target) return;

    this.pushHistory();
    const preds = ProjectEngine.parsePredecessors(target.predecessors);
    if (!preds.some(p => p.id === fromId)) {
      preds.push({ id: fromId, type, lag: 0 });
      target.predecessors = preds.map(p => `${p.id}${p.type}`).join(', ');
      this.recalculateAndSave();
    }
  },

  unlinkTasks(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.predecessors) return;

    this.pushHistory();
    task.predecessors = '';
    this.recalculateAndSave();
  },

  saveBaseline() {
    this.pushHistory();
    this.tasks.forEach(t => {
      t.baselineStart = t.start;
      t.baselineEnd = t.end;
      t.baselineDuration = t.duration;
    });
    this.project.baselineSaved = true;
    this.recalculateAndSave();
  },

  toggleCriticalPath() {
    this.project.showCriticalPath = !this.project.showCriticalPath;
    this.eventBus.emit('displayOptionsChanged', this.project);
  },

  toggleBaseline() {
    this.project.showBaseline = !this.project.showBaseline;
    this.eventBus.emit('displayOptionsChanged', this.project);
  },

  setZoom(zoom) {
    if (['day', 'week', 'month', 'quarter'].includes(zoom)) {
      this.project.zoom = zoom;
      this.eventBus.emit('zoomChanged', zoom);
    }
  },

  setView(view) {
    if (['gantt', 'kanban', 'resources', 'dashboard', 'calendar', 'curvaS', 'portfolio'].includes(view)) {
      this.project.view = view;
      this.eventBus.emit('viewChanged', view);
    }
  },

  selectTask(taskId) {
    this.selectedTaskId = taskId;
    this.eventBus.emit('taskSelected', taskId);
  }
};

window.State = State;
