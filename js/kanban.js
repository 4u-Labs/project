/**
 * ProjectClone - Quadro Ágil Kanban Integrado
 */

const KanbanView = {
  container: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    State.eventBus.on('tasksUpdated', () => {
      if (State.project.view === 'kanban') this.render();
    });
    State.eventBus.on('viewChanged', (view) => {
      if (view === 'kanban') this.render();
    });
    State.eventBus.on('langChanged', () => {
      if (State.project.view === 'kanban') this.render();
    });

    this.bindEvents();
  },

  render() {
    if (!this.container) return;

    const tasks = (State.tasks || []).filter(t => !t.isSummary);
    const resources = State.resources || [];
    const resMap = new Map();
    resources.forEach(r => resMap.set(r.id, r));

    // Categorizar em 4 colunas
    const cols = {
      backlog: [],
      todo: [],
      inProgress: [],
      done: []
    };

    tasks.forEach(t => {
      if (t.progress >= 100) {
        cols.done.push(t);
      } else if (t.progress > 0) {
        cols.inProgress.push(t);
      } else if (!t.start || t.start > ProjectEngine.formatDate(new Date())) {
        cols.backlog.push(t);
      } else {
        cols.todo.push(t);
      }
    });

    const renderCard = (t) => {
      const isCrit = t.isCritical && State.project.showCriticalPath;
      const isMilestone = t.milestone || t.duration === 0;
      const resBadges = (t.resourceIds || []).map(id => {
        const r = resMap.get(id);
        return r ? `<span class="res-tag-mini" title="${r.name}">${r.name.split(' ')[0]}</span>` : '';
      }).join(' ');

      return `
        <div class="kanban-card ${isCrit ? 'card-critical' : ''} ${isMilestone ? 'card-milestone' : ''}" 
             draggable="true" data-id="${t.id}">
          <div class="card-header">
            <span class="card-wbs">${t.wbs || ''}</span>
            ${isCrit ? '<span class="badge-critical">CRÍTICO</span>' : ''}
            ${isMilestone ? '<span class="badge-milestone">💎 MARCO</span>' : ''}
          </div>
          <div class="card-title">${t.name}</div>
          <div class="card-dates">${t.start} ➔ ${t.end} (${t.duration}d)</div>
          <div class="card-progress-bar">
            <div class="card-progress-fill" style="width: ${t.progress || 0}%;"></div>
          </div>
          <div class="card-footer">
            <span class="card-pct">${t.progress || 0}%</span>
            <div class="card-resources">${resBadges}</div>
          </div>
        </div>
      `;
    };

    this.container.innerHTML = `
      <div class="kanban-board">
        <!-- Coluna 1: Backlog -->
        <div class="kanban-column" data-col="backlog">
          <div class="col-head">
            <span class="col-title">${I18N.t('kbBacklog')}</span>
            <span class="col-count">${cols.backlog.length}</span>
          </div>
          <div class="col-body" data-col="backlog">
            ${cols.backlog.map(renderCard).join('')}
          </div>
        </div>

        <!-- Coluna 2: A Fazer -->
        <div class="kanban-column" data-col="todo">
          <div class="col-head">
            <span class="col-title">${I18N.t('kbTodo')}</span>
            <span class="col-count">${cols.todo.length}</span>
          </div>
          <div class="col-body" data-col="todo">
            ${cols.todo.map(renderCard).join('')}
          </div>
        </div>

        <!-- Coluna 3: Em Andamento -->
        <div class="kanban-column" data-col="inProgress">
          <div class="col-head">
            <span class="col-title">${I18N.t('kbInProgress')}</span>
            <span class="col-count">${cols.inProgress.length}</span>
          </div>
          <div class="col-body" data-col="inProgress">
            ${cols.inProgress.map(renderCard).join('')}
          </div>
        </div>

        <!-- Coluna 4: Concluído -->
        <div class="kanban-column" data-col="done">
          <div class="col-head">
            <span class="col-title">${I18N.t('kbDone')}</span>
            <span class="col-count">${cols.done.length}</span>
          </div>
          <div class="col-body" data-col="done">
            ${cols.done.map(renderCard).join('')}
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    let draggedId = null;

    this.container.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.kanban-card');
      if (card) {
        draggedId = parseInt(card.getAttribute('data-id'), 10);
        card.classList.add('is-dragging');
        e.dataTransfer.setData('text/plain', String(draggedId));
      }
    });

    this.container.addEventListener('dragend', (e) => {
      const card = e.target.closest('.kanban-card');
      if (card) card.classList.remove('is-dragging');
      this.container.querySelectorAll('.col-body').forEach(c => c.classList.remove('drag-over'));
    });

    this.container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const colBody = e.target.closest('.col-body');
      if (colBody) colBody.classList.add('drag-over');
    });

    this.container.addEventListener('dragleave', (e) => {
      const colBody = e.target.closest('.col-body');
      if (colBody && !colBody.contains(e.relatedTarget)) {
        colBody.classList.remove('drag-over');
      }
    });

    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const colBody = e.target.closest('.col-body');
      if (!colBody || !draggedId) return;

      colBody.classList.remove('drag-over');
      const targetCol = colBody.getAttribute('data-col');
      const task = State.tasks.find(t => t.id === draggedId);
      if (!task) return;

      if (targetCol === 'done') {
        State.updateTask(draggedId, { progress: 100 });
      } else if (targetCol === 'inProgress') {
        State.updateTask(draggedId, { progress: task.progress > 0 && task.progress < 100 ? task.progress : 50 });
      } else if (targetCol === 'todo') {
        State.updateTask(draggedId, { progress: 0 });
      } else if (targetCol === 'backlog') {
        State.updateTask(draggedId, { progress: 0 });
      }

      this.render();
    });

    this.container.addEventListener('dblclick', (e) => {
      const card = e.target.closest('.kanban-card');
      if (card) {
        const id = parseInt(card.getAttribute('data-id'), 10);
        if (window.App) window.App.openTaskModal(id);
      }
    });
  }
};

window.KanbanView = KanbanView;
