/**
 * ProjectClone - Folha de Recursos & Alocação de Custos
 */

const ResourcesView = {
  container: null,

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

    // Calcular estatísticas por recurso
    const stats = new Map();
    resources.forEach(r => {
      stats.set(r.id, {
        taskCount: 0,
        totalHours: 0,
        totalCost: 0,
        assignedTasks: []
      });
    });

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
              st.totalCost += hours * (r.standardRate || 0);
            }
            st.assignedTasks.push(t);
          }
        });
      }
    });

    // Renderizar tabela de recursos
    let rowsHtml = '';
    resources.forEach(r => {
      const st = stats.get(r.id) || { taskCount: 0, totalHours: 0, totalCost: 0, assignedTasks: [] };
      const costFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: State.project.currency || 'BRL' }).format(st.totalCost);
      const rateFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: State.project.currency || 'BRL' }).format(r.standardRate || 0);

      rowsHtml += `
        <tr data-id="${r.id}">
          <td style="text-align: center;">${r.id}</td>
          <td><strong>${r.name}</strong></td>
          <td><span class="badge-type">${r.type === 'material' ? I18N.t('resMaterial') : I18N.t('resWork')}</span></td>
          <td>${r.role || '-'}</td>
          <td style="text-align: right;">${rateFmt} / h</td>
          <td style="text-align: center;">
            <span class="badge-count" title="${st.assignedTasks.map(t => t.name).join(', ')}">${st.taskCount}</span>
          </td>
          <td style="text-align: right; font-weight: bold; color: #107c41;">${costFmt}</td>
          <td style="text-align: center;">
            <button class="btn-res-action btn-del-res" data-id="${r.id}" title="Excluir">✕</button>
          </td>
        </tr>
      `;
    });

    this.container.innerHTML = `
      <div class="resources-wrap">
        <div class="resources-toolbar">
          <h2>👥 ${I18N.t('viewResources')}</h2>
          <button class="btn-primary" id="btnAddResource">+ ${I18N.t('resAdd')}</button>
        </div>

        <table class="res-table">
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">ID</th>
              <th>${I18N.t('resName')}</th>
              <th style="width: 110px;">${I18N.t('resType')}</th>
              <th>${I18N.t('resRole')}</th>
              <th style="width: 140px; text-align: right;">${I18N.t('resRate')}</th>
              <th style="width: 130px; text-align: center;">${I18N.t('resTasksCount')}</th>
              <th style="width: 160px; text-align: right;">${I18N.t('resTotalCost')}</th>
              <th style="width: 80px; text-align: center;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #888;">Nenhum recurso cadastrado ainda. Clique em "+ ${I18N.t('resAdd')}".</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  },

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target.id === 'btnAddResource') {
        this.openAddPrompt();
        return;
      }

      const delBtn = e.target.closest('.btn-del-res');
      if (delBtn) {
        const id = parseInt(delBtn.getAttribute('data-id'), 10);
        if (confirm('Deseja excluir este recurso?')) {
          State.pushHistory();
          State.resources = State.resources.filter(r => r.id !== id);
          // Remove de tarefas
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
      type: 'work'
    });

    State.recalculateAndSave();
    State.eventBus.emit('resourcesUpdated', State.resources);
  }
};

window.ResourcesView = ResourcesView;
