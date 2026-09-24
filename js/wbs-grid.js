/**
 * ProjectClone - Tabela WBS / EAP Editável e Interativa (Estilo Excel / MS Project)
 */

const WBSGrid = {
  container: null,
  bodyEl: null,
  rowHeight: 38, // Altura padrão de cada linha em pixels

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.renderSkeleton();
    this.bindEvents();

    State.eventBus.on('tasksUpdated', () => this.render());
    State.eventBus.on('taskSelected', (id) => this.highlightSelectedRow(id));
    State.eventBus.on('langChanged', () => this.render());
  },

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="wbs-table-wrap">
        <table class="wbs-table" id="wbsTable">
          <thead>
            <tr>
              <th style="width: 44px; text-align: center;"><span title="Indicador">🚩</span></th>
              <th style="width: 42px; text-align: center;" data-i18n="colId">ID</th>
              <th style="width: 80px;" data-i18n="colWbs">EAP</th>
              <th style="min-width: 240px;" data-i18n="colName">Nome da Tarefa</th>
              <th style="width: 80px; text-align: right;" data-i18n="colDuration">Duração</th>
              <th style="width: 105px;" data-i18n="colStart">Início</th>
              <th style="width: 105px;" data-i18n="colEnd">Término</th>
              <th style="width: 95px;" data-i18n="colPredecessors">Predec.</th>
              <th style="width: 80px; text-align: center;" data-i18n="colProgress">%</th>
              <th style="width: 140px;" data-i18n="colResources">Recursos</th>
              <th style="width: 70px; text-align: center;">...</th>
            </tr>
          </thead>
          <tbody id="wbsTableBody"></tbody>
        </table>
      </div>
    `;
    this.bodyEl = document.getElementById('wbsTableBody');
  },

  render() {
    if (!this.bodyEl) return;
    const tasks = State.tasks || [];
    const resources = State.resources || [];
    const resMap = new Map();
    resources.forEach(r => resMap.set(r.id, r));

    // Identificar recursos sobrealocados
    const overResIds = new Set();
    if (window.ProjectEngine && ProjectEngine.computeResourceWorkload) {
      const wl = ProjectEngine.computeResourceWorkload({ tasks: State.tasks, resources: State.resources });
      (wl.resources || []).forEach(r => { if (r.isOverallocated) overResIds.add(r.id); });
    }

    let html = '';
    let isHiddenByParent = false;
    let hiddenLevel = 999;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const level = task.level || 0;

      // Controle de colapso de nós-pais
      if (level > hiddenLevel) {
        continue;
      } else {
        hiddenLevel = 999;
      }

      if (task.isSummary && task.collapsed) {
        hiddenLevel = level;
      }

      const isSelected = State.selectedTaskId === task.id;
      const isCritical = task.isCritical && State.project.showCriticalPath;
      const isMilestone = task.milestone || task.duration === 0;

      // Status indicator
      let statusIcon = '⚪';
      let statusTitle = I18N.t('statusNotStarted');
      if (task.progress >= 100) {
        statusIcon = '✅';
        statusTitle = I18N.t('statusCompleted');
      } else if (task.progress > 0) {
        statusIcon = '⏳';
        statusTitle = I18N.t('statusInProgress');
      }
      if (isCritical) {
        statusIcon = '🔥';
        statusTitle = I18N.t('statusCritical');
      }
      if (isMilestone) {
        statusIcon = '💎';
        statusTitle = I18N.t('statusMilestone');
      }
      if (task.constraintType && task.constraintType !== 'ASAP') {
        statusIcon += ' 📌';
        statusTitle += ` [Restrição: ${task.constraintType} ${task.constraintDate || ''}]`;
      }
      if (task.levelingDelay && task.levelingDelay > 0) {
        statusIcon += ' ⚡';
        statusTitle += ` [Nivelado: +${task.levelingDelay}d]`;
      }
      const hasOverRes = !task.isSummary && (task.resourceIds || []).some(id => overResIds.has(id));
      if (hasOverRes) {
        statusIcon += ' ⚠️';
        statusTitle += ' [Recurso Sobrealocado]';
      }

      // Recursos
      const assignedNames = (task.resourceIds || [])
        .map(id => {
          const r = resMap.get(id);
          return r ? `<span class="res-tag" title="${r.role}">${r.name.split(' ')[0]}</span>` : '';
        })
        .join(' ');

      // Indentação
      const indentPx = level * 18;
      const toggleIcon = task.isSummary 
        ? `<span class="wbs-toggle-exp" data-toggle-id="${task.id}">${task.collapsed ? '▶' : '▼'}</span>` 
        : '<span class="wbs-leaf-spacer"></span>';

      html += `
        <tr class="wbs-row ${isSelected ? 'selected' : ''} ${task.isSummary ? 'wbs-summary-row' : ''} ${isCritical ? 'critical-row' : ''}" 
            data-id="${task.id}" style="height: ${this.rowHeight}px;">
          <td class="col-indicator" title="${statusTitle}">${statusIcon}</td>
          <td class="col-id" draggable="true" title="Arraste pelo número para reordenar tarefa"><span class="drag-grip">⠿</span> ${task.id}</td>
          <td class="col-wbs">${task.wbs || ''}</td>
          <td class="col-name" style="padding-left: ${8 + indentPx}px;">
            ${toggleIcon}
            <span class="cell-editable text-name" data-field="name" data-id="${task.id}" title="${task.name}">${task.name}</span>
          </td>
          <td class="col-duration">
            <span class="cell-editable" data-field="duration" data-id="${task.id}">
              ${isMilestone ? '0 ' + I18N.t('daysSuffix') : (task.duration || 1) + ' ' + (task.duration === 1 ? I18N.t('daySuffix') : I18N.t('daysSuffix'))}
            </span>
          </td>
          <td class="col-date">
            <span class="cell-editable text-date" data-field="start" data-id="${task.id}">${task.start || ''}</span>
          </td>
          <td class="col-date">
            <span class="cell-editable text-date" data-field="end" data-id="${task.id}">${task.end || ''}</span>
          </td>
          <td class="col-pred">
            <span class="cell-editable" data-field="predecessors" data-id="${task.id}">${task.predecessors || ''}</span>
          </td>
          <td class="col-progress">
            <span class="cell-editable" data-field="progress" data-id="${task.id}">${task.progress || 0}%</span>
          </td>
          <td class="col-resources" data-res-id="${task.id}">
            <div class="res-list">${assignedNames || '<span class="res-none">+</span>'}</div>
          </td>
          <td class="col-actions">
            <button class="wbs-btn-icon btn-quick-add" data-id="${task.id}" title="Adicionar Subtarefa">+</button>
            <button class="wbs-btn-icon btn-quick-del" data-id="${task.id}" title="Excluir">✕</button>
          </td>
        </tr>
      `;
    }

    this.bodyEl.innerHTML = html;
  },

  highlightSelectedRow(taskId) {
    if (!this.bodyEl) return;
    this.bodyEl.querySelectorAll('tr').forEach(tr => {
      if (parseInt(tr.getAttribute('data-id'), 10) === taskId) {
        tr.classList.add('selected');
        tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        tr.classList.remove('selected');
      }
    });
  },

  bindEvents() {
    // Seleção de linha e expansão
    this.container.addEventListener('click', (e) => {
      const toggle = e.target.closest('.wbs-toggle-exp');
      if (toggle) {
        const id = parseInt(toggle.getAttribute('data-toggle-id'), 10);
        const task = State.tasks.find(t => t.id === id);
        if (task) {
          task.collapsed = !task.collapsed;
          this.render();
          if (window.GanttChart) window.GanttChart.render();
        }
        return;
      }

      const quickAdd = e.target.closest('.btn-quick-add');
      if (quickAdd) {
        const id = parseInt(quickAdd.getAttribute('data-id'), 10);
        State.addTask({}, id);
        return;
      }

      const quickDel = e.target.closest('.btn-quick-del');
      if (quickDel) {
        const id = parseInt(quickDel.getAttribute('data-id'), 10);
        if (confirm(I18N.t('actDeleteTask') + '?')) {
          State.deleteTask(id);
        }
        return;
      }

      const resCell = e.target.closest('.col-resources');
      if (resCell) {
        const id = parseInt(resCell.getAttribute('data-res-id'), 10);
        State.selectTask(id);
        if (window.App) window.App.openTaskModal(id);
        return;
      }

      const row = e.target.closest('.wbs-row');
      if (row) {
        const id = parseInt(row.getAttribute('data-id'), 10);
        State.selectTask(id);
      }
    });

    // Edição inline com duplo clique
    this.container.addEventListener('dblclick', (e) => {
      const editable = e.target.closest('.cell-editable');
      if (!editable) return;

      const field = editable.getAttribute('data-field');
      const id = parseInt(editable.getAttribute('data-id'), 10);
      const task = State.tasks.find(t => t.id === id);
      if (!task) return;

      // Resumo não edita duração nem datas diretamente
      if (task.isSummary && (field === 'duration' || field === 'start' || field === 'end')) {
        return;
      }

      this.startInlineEdit(editable, task, field);
    });

    // Sincronização de scroll vertical com Gantt
    const wrap = this.container.querySelector('.wbs-table-wrap');
    if (wrap) {
      wrap.addEventListener('scroll', () => {
        if (window.GanttChart && window.GanttChart.bodyWrap) {
          window.GanttChart.bodyWrap.scrollTop = wrap.scrollTop;
        }
      });
    }

    // Reordenação de Linhas por Arraste (Drag & Drop)
    this.container.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.wbs-row');
      if (!row) return;
      this.draggedTaskId = parseInt(row.getAttribute('data-id'), 10);
      row.classList.add('wbs-row-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(this.draggedTaskId));
    });

    this.container.addEventListener('dragover', (e) => {
      const row = e.target.closest('.wbs-row');
      if (!row || !this.draggedTaskId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        row.classList.add('drag-over-top');
        row.classList.remove('drag-over-bottom');
      } else {
        row.classList.add('drag-over-bottom');
        row.classList.remove('drag-over-top');
      }
    });

    this.container.addEventListener('dragleave', (e) => {
      const row = e.target.closest('.wbs-row');
      if (row) {
        row.classList.remove('drag-over-top', 'drag-over-bottom');
      }
    });

    this.container.addEventListener('dragend', () => {
      this.draggedTaskId = null;
      document.querySelectorAll('.wbs-row').forEach(r => {
        r.classList.remove('wbs-row-dragging', 'drag-over-top', 'drag-over-bottom');
      });
    });

    this.container.addEventListener('drop', (e) => {
      const row = e.target.closest('.wbs-row');
      if (!row || !this.draggedTaskId) return;
      e.preventDefault();

      const targetId = parseInt(row.getAttribute('data-id'), 10);
      const sourceId = this.draggedTaskId;
      row.classList.remove('drag-over-top', 'drag-over-bottom');

      if (sourceId && targetId && sourceId !== targetId) {
        const rect = row.getBoundingClientRect();
        const isAbove = e.clientY < (rect.top + rect.height / 2);
        this.reorderTasks(sourceId, targetId, isAbove);
      }
      this.draggedTaskId = null;
    });
  },

  reorderTasks(sourceId, targetId, isAbove) {
    const sourceIdx = State.tasks.findIndex(t => t.id === sourceId);
    const targetIdx = State.tasks.findIndex(t => t.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const task = State.tasks[sourceIdx];
    State.pushHistory();

    // Remove da posição atual
    State.tasks.splice(sourceIdx, 1);

    // Encontra índice atualizado do alvo
    let newTargetIdx = State.tasks.findIndex(t => t.id === targetId);
    let insertIdx = isAbove ? newTargetIdx : newTargetIdx + 1;
    State.tasks.splice(insertIdx, 0, task);

    // Ajusta nível hierárquico coerente com os vizinhos
    const currentIdx = State.tasks.indexOf(task);
    const prevTask = State.tasks[currentIdx - 1];
    if (prevTask) {
      if (prevTask.isSummary && isAbove) {
        task.level = prevTask.level;
      } else if (prevTask.isSummary && !isAbove) {
        task.level = prevTask.level + 1;
      } else {
        task.level = prevTask.level;
      }
    } else {
      task.level = 0;
    }

    State.recalculateAndSave();
    if (window.App && window.App.showToast) {
      window.App.showToast(`Tarefa "${task.name}" reordenada.`);
    }
  },

  startInlineEdit(el, task, field) {
    let currentVal = task[field] !== undefined ? task[field] : '';
    let inputType = 'text';

    if (field === 'start' || field === 'end') inputType = 'date';
    if (field === 'duration' || field === 'progress') inputType = 'number';

    const input = document.createElement('input');
    input.type = inputType;
    input.className = 'wbs-inline-input';
    input.value = currentVal;
    if (field === 'progress') {
      input.min = 0; input.max = 100;
    }
    if (field === 'duration') {
      input.min = 0;
    }

    el.innerHTML = '';
    el.appendChild(input);
    input.focus();
    if (inputType === 'text') input.select();

    const finishEdit = (save) => {
      if (!input.parentNode) return;
      if (save) {
        let val = input.value.trim();
        if (field === 'progress') val = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
        if (field === 'duration') val = Math.max(0, parseInt(val, 10) || 0);

        const changes = {};
        changes[field] = val;
        State.updateTask(task.id, changes);
      } else {
        this.render();
      }
    };

    input.addEventListener('blur', () => finishEdit(true));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEdit(true);
      } else if (e.key === 'Escape') {
        finishEdit(false);
      }
    });
  }
};

window.WBSGrid = WBSGrid;
