/**
 * ProjectClone - Motor do Gráfico de Gantt Interativo (SVG & Canvas High-Performance)
 */

const GanttChart = {
  container: null,
  headerEl: null,
  bodyWrap: null,
  timelineEl: null,
  svgLayer: null,

  rowHeight: 38,
  barHeight: 22,
  colWidth: 40,
  minDate: null,
  maxDate: null,
  totalDays: 0,
  dayWidth: 40, // Largura em pixels por dia

  // Estado de arrasto
  dragging: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.renderSkeleton();
    this.bindEvents();

    State.eventBus.on('tasksUpdated', () => this.render());
    State.eventBus.on('zoomChanged', () => this.render());
    State.eventBus.on('displayOptionsChanged', () => this.render());
    State.eventBus.on('taskSelected', (id) => this.highlightSelectedBar(id));
    State.eventBus.on('langChanged', () => this.render());
  },

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="gantt-root">
        <div class="gantt-header-sticky" id="ganttHeader"></div>
        <div class="gantt-body-scroll" id="ganttBodyScroll">
          <div class="gantt-timeline-content" id="ganttTimeline">
            <!-- Grid de fundo de colunas e dias não úteis -->
            <div class="gantt-grid-bg" id="ganttGridBg"></div>
            <!-- Linha vertical de Hoje -->
            <div class="gantt-today-line" id="ganttTodayLine"></div>
            <!-- Camada SVG de setas de dependência -->
            <svg class="gantt-svg-layer" id="ganttSvgLayer"></svg>
            <!-- Linhas e Barras de Tarefas -->
            <div class="gantt-bars-layer" id="ganttBarsLayer"></div>
          </div>
        </div>
      </div>
    `;

    this.headerEl = document.getElementById('ganttHeader');
    this.bodyWrap = document.getElementById('ganttBodyScroll');
    this.timelineEl = document.getElementById('ganttTimeline');
    this.svgLayer = document.getElementById('ganttSvgLayer');
    this.barsLayer = document.getElementById('ganttBarsLayer');
    this.gridBg = document.getElementById('ganttGridBg');
    this.todayLine = document.getElementById('ganttTodayLine');
  },

  calculateDateRange() {
    const tasks = State.tasks || [];
    let startD = new Date();
    let endD = new Date();
    endD.setDate(endD.getDate() + 30);

    if (tasks.length > 0) {
      let minStr = tasks[0].start || '';
      let maxStr = tasks[0].end || '';

      tasks.forEach(t => {
        if (t.start && (!minStr || t.start < minStr)) minStr = t.start;
        if (t.end && (!maxStr || t.end > maxStr)) maxStr = t.end;
      });

      if (minStr) startD = ProjectEngine.parseDate(minStr);
      if (maxStr) endD = ProjectEngine.parseDate(maxStr);
    }

    // Margens antes e depois
    startD.setDate(startD.getDate() - 7);
    endD.setDate(endD.getDate() + 21);

    this.minDate = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate());
    this.maxDate = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate());

    const diffMs = this.maxDate - this.minDate;
    this.totalDays = Math.max(30, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Determina pixels por dia de acordo com o zoom
    const zoom = State.project.zoom || 'week';
    if (zoom === 'day') {
      this.dayWidth = 42;
    } else if (zoom === 'week') {
      this.dayWidth = 24;
    } else if (zoom === 'month') {
      this.dayWidth = 10;
    } else { // quarter
      this.dayWidth = 5;
    }
  },

  dateToX(dateStr) {
    if (!dateStr || !this.minDate) return 0;
    const d = ProjectEngine.parseDate(dateStr);
    const diff = (d - this.minDate) / (1000 * 60 * 60 * 24);
    return Math.round(diff * this.dayWidth);
  },

  xToDate(x) {
    if (!this.minDate) return '';
    const days = Math.round(x / this.dayWidth);
    const d = new Date(this.minDate);
    d.setDate(d.getDate() + days);
    return ProjectEngine.formatDate(d);
  },

  render() {
    this.calculateDateRange();
    const totalWidth = Math.max(1200, this.totalDays * this.dayWidth);

    // Ajusta dimensões da timeline
    this.timelineEl.style.width = `${totalWidth}px`;
    this.svgLayer.setAttribute('width', totalWidth);

    this.renderHeader(totalWidth);
    this.renderGridAndToday(totalWidth);
    this.renderBarsAndDependencies(totalWidth);
  },

  renderHeader(totalWidth) {
    const zoom = State.project.zoom || 'week';
    let topHtml = '';
    let bottomHtml = '';

    const cur = new Date(this.minDate);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const daysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    if (zoom === 'day' || zoom === 'week') {
      // Linha superior: Agrupamento por Mês/Ano
      let curMonth = -1;
      let monthStartX = 0;
      let monthName = '';

      for (let i = 0; i < this.totalDays; i++) {
        const d = new Date(this.minDate);
        d.setDate(d.getDate() + i);
        const m = d.getMonth();
        const y = d.getFullYear();

        if (m !== curMonth) {
          if (curMonth !== -1) {
            const w = (i * this.dayWidth) - monthStartX;
            topHtml += `<div class="gantt-header-cell top-cell" style="left:${monthStartX}px; width:${w}px;">${monthName}</div>`;
          }
          curMonth = m;
          monthStartX = i * this.dayWidth;
          monthName = `${months[m]} ${y}`;
        }

        // Linha inferior
        const dayX = i * this.dayWidth;
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const wkClass = isWeekend ? 'weekend-header' : '';

        if (zoom === 'day') {
          bottomHtml += `
            <div class="gantt-header-cell bottom-cell ${wkClass}" style="left:${dayX}px; width:${this.dayWidth}px;">
              <span class="d-num">${d.getDate()}</span>
              <span class="d-short">${daysShort[d.getDay()]}</span>
            </div>
          `;
        } else {
          // Semana
          if (d.getDay() === 1 || i === 0) { // Segunda-feira
            bottomHtml += `
              <div class="gantt-header-cell bottom-cell week-cell" style="left:${dayX}px; width:${this.dayWidth * 7}px;">
                ${d.getDate()}/${m + 1}
              </div>
            `;
          }
        }
      }

      // Último mês
      const lastW = (this.totalDays * this.dayWidth) - monthStartX;
      topHtml += `<div class="gantt-header-cell top-cell" style="left:${monthStartX}px; width:${lastW}px;">${monthName}</div>`;
    } else {
      // Meses ou Trimestres
      let curYear = -1;
      let yearStartX = 0;

      for (let i = 0; i < this.totalDays; i++) {
        const d = new Date(this.minDate);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();

        if (y !== curYear) {
          if (curYear !== -1) {
            const w = (i * this.dayWidth) - yearStartX;
            topHtml += `<div class="gantt-header-cell top-cell" style="left:${yearStartX}px; width:${w}px;">${curYear}</div>`;
          }
          curYear = y;
          yearStartX = i * this.dayWidth;
        }

        if (d.getDate() === 1) {
          const mX = i * this.dayWidth;
          bottomHtml += `
            <div class="gantt-header-cell bottom-cell" style="left:${mX}px; width:${this.dayWidth * 30}px;">
              ${months[d.getMonth()]}
            </div>
          `;
        }
      }
      const lastW = (this.totalDays * this.dayWidth) - yearStartX;
      topHtml += `<div class="gantt-header-cell top-cell" style="left:${yearStartX}px; width:${lastW}px;">${curYear}</div>`;
    }

    this.headerEl.innerHTML = `
      <div class="gantt-header-row top-row" style="width:${totalWidth}px;">${topHtml}</div>
      <div class="gantt-header-row bottom-row" style="width:${totalWidth}px;">${bottomHtml}</div>
    `;
  },

  renderGridAndToday(totalWidth) {
    let gridHtml = '';
    for (let i = 0; i < this.totalDays; i++) {
      const d = new Date(this.minDate);
      d.setDate(d.getDate() + i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (isWeekend) {
        const x = i * this.dayWidth;
        gridHtml += `<div class="weekend-col" style="left:${x}px; width:${this.dayWidth}px;"></div>`;
      }
    }
    this.gridBg.innerHTML = gridHtml;

    // Linha de hoje
    const todayStr = ProjectEngine.formatDate(new Date());
    const todayX = this.dateToX(todayStr);
    if (todayX >= 0 && todayX <= totalWidth) {
      this.todayLine.style.display = 'block';
      this.todayLine.style.left = `${todayX}px`;
      this.todayLine.setAttribute('title', 'Hoje / Today: ' + todayStr);
    } else {
      this.todayLine.style.display = 'none';
    }
  },

  renderBarsAndDependencies(totalWidth) {
    const tasks = State.tasks || [];
    let barsHtml = '';
    const taskCoords = new Map(); // Para traçar dependências: id -> { x, y, width, isSummary, milestone }

    let rowIndex = 0;
    let hiddenLevel = 999;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const level = task.level || 0;

      if (level > hiddenLevel) continue;
      else hiddenLevel = 999;

      if (task.isSummary && task.collapsed) {
        hiddenLevel = level;
      }

      const topY = rowIndex * this.rowHeight;
      const isSelected = State.selectedTaskId === task.id;
      const isCritical = task.isCritical && State.project.showCriticalPath;
      const isMilestone = task.milestone || task.duration === 0;

      const x = this.dateToX(task.start);
      const endX = this.dateToX(task.end) + this.dayWidth;
      const width = Math.max(isMilestone ? 20 : 28, endX - x);

      taskCoords.set(task.id, {
        x,
        endX,
        width,
        y: topY + (this.rowHeight / 2),
        isSummary: task.isSummary,
        milestone: isMilestone
      });

      // Linha de fundo da linha do Gantt (para alinhamento visual com a WBS)
      barsHtml += `<div class="gantt-row-guide ${rowIndex % 2 === 1 ? 'alt-row' : ''} ${isSelected ? 'selected-row' : ''}" style="top:${topY}px; height:${this.rowHeight}px; width:${totalWidth}px;"></div>`;

      // Linha de Base (Baseline Ghost Bar)
      if (State.project.showBaseline && task.baselineStart && task.baselineEnd) {
        const bx = this.dateToX(task.baselineStart);
        const bendX = this.dateToX(task.baselineEnd) + this.dayWidth;
        const bwidth = Math.max(10, bendX - bx);
        barsHtml += `
          <div class="gantt-baseline-bar" style="left:${bx}px; top:${topY + 26}px; width:${bwidth}px;" title="Baseline: ${task.baselineStart} a ${task.baselineEnd}"></div>
        `;
      }

      // Renderização do elemento da barra
      if (isMilestone) {
        // Losango de Marco
        barsHtml += `
          <div class="gantt-milestone-wrap ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-item' : ''}" 
               data-id="${task.id}" style="left:${x - 10}px; top:${topY + 9}px;">
            <div class="gantt-milestone-diamond" title="${task.name} (${task.start})"></div>
            <span class="gantt-bar-label">${task.name}</span>
          </div>
        `;
      } else if (task.isSummary) {
        // Barra Resumo / Fase (com braços para baixo)
        barsHtml += `
          <div class="gantt-summary-bar ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-item' : ''}" 
               data-id="${task.id}" style="left:${x}px; top:${topY + 11}px; width:${width}px;">
            <div class="summary-body"></div>
            <div class="summary-bracket-left"></div>
            <div class="summary-bracket-right"></div>
            <span class="gantt-bar-label">${task.name} (${task.progress}%)</span>
          </div>
        `;
      } else {
        // Tarefa Normal Interativa
        const progressW = Math.round((width * (task.progress || 0)) / 100);
        barsHtml += `
          <div class="gantt-task-bar ${isSelected ? 'selected' : ''} ${isCritical ? 'critical-bar' : ''}" 
               data-id="${task.id}" style="left:${x}px; top:${topY + 8}px; width:${width}px; height:${this.barHeight}px;">
            <!-- Preenchimento de Progresso -->
            <div class="gantt-progress-fill" style="width:${progressW}px;"></div>
            
            <!-- Alças de Redimensionamento -->
            <div class="gantt-handle handle-left" data-id="${task.id}" data-action="resize-left" title="Arrastar Início"></div>
            <div class="gantt-handle handle-right" data-id="${task.id}" data-action="resize-right" title="Arrastar Término"></div>

            <!-- Pinos para criar Dependências com drag-and-drop -->
            <div class="gantt-link-pin pin-left" data-id="${task.id}" data-pin="in" title="Predecessora"></div>
            <div class="gantt-link-pin pin-right" data-id="${task.id}" data-pin="out" title="Ligue à sucessora"></div>

            <!-- Nome / Informações da Tarefa -->
            <span class="gantt-bar-label inside-label">${task.name}</span>
            <span class="gantt-bar-label outside-label" style="left:${width + 8}px;">${task.progress}%</span>
          </div>
        `;
      }

      rowIndex++;
    }

    const totalHeight = Math.max(600, rowIndex * this.rowHeight);
    this.barsLayer.style.height = `${totalHeight}px`;
    this.svgLayer.setAttribute('height', totalHeight);
    this.barsLayer.innerHTML = barsHtml;

    // Renderizar Setas de Dependência
    this.renderDependencies(tasks, taskCoords);
  },

  renderDependencies(tasks, coords) {
    let svgPaths = '';

    // Marcador de seta SVG
    svgPaths += `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#718096" />
        </marker>
        <marker id="arrow-critical" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#e53e3e" />
        </marker>
      </defs>
    `;

    tasks.forEach(task => {
      if (!task.predecessors) return;
      const targetCoord = coords.get(task.id);
      if (!targetCoord) return;

      const links = ProjectEngine.parsePredecessors(task.predecessors);
      links.forEach(link => {
        const predCoord = coords.get(link.id);
        if (!predCoord) return;

        const isCrit = (task.isCritical && State.tasks.find(t => t.id === link.id)?.isCritical) && State.project.showCriticalPath;
        const color = isCrit ? '#e53e3e' : '#718096';
        const marker = isCrit ? 'url(#arrow-critical)' : 'url(#arrow)';

        // Coordenadas de origem e destino
        let x1 = predCoord.endX;
        let y1 = predCoord.y;
        let x2 = targetCoord.x;
        let y2 = targetCoord.y;

        if (link.type === 'SS') {
          x1 = predCoord.x;
          x2 = targetCoord.x;
        }

        // Curva Bezier / Ortogonal elegante
        const midX = x1 + Math.max(12, (x2 - x1) / 2);
        const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 4} ${y2}`;

        svgPaths += `
          <path d="${pathData}" fill="none" stroke="${color}" stroke-width="${isCrit ? '2.5' : '1.8'}" 
                marker-end="${marker}" opacity="0.85" />
        `;
      });
    });

    this.svgLayer.innerHTML = svgPaths;
  },

  highlightSelectedBar(taskId) {
    if (!this.barsLayer) return;
    this.barsLayer.querySelectorAll('[data-id]').forEach(el => {
      if (parseInt(el.getAttribute('data-id'), 10) === taskId) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  },

  bindEvents() {
    // Scroll sincronizado com WBS
    if (this.bodyWrap) {
      this.bodyWrap.addEventListener('scroll', () => {
        if (this.headerEl) {
          this.headerEl.scrollLeft = this.bodyWrap.scrollLeft;
        }
        const wbsWrap = document.querySelector('.wbs-table-wrap');
        if (wbsWrap) {
          wbsWrap.scrollTop = this.bodyWrap.scrollTop;
        }
      });
    }

    // Seleção de barra e início de Drag & Drop
    this.container.addEventListener('mousedown', (e) => {
      // Conexão de dependência via pino
      const pin = e.target.closest('.gantt-link-pin');
      if (pin) {
        e.stopPropagation();
        e.preventDefault();
        const fromId = parseInt(pin.getAttribute('data-id'), 10);
        this.startPinLink(fromId, e);
        return;
      }

      // Redimensionamento pelas alças
      const handle = e.target.closest('.gantt-handle');
      if (handle) {
        e.stopPropagation();
        e.preventDefault();
        const id = parseInt(handle.getAttribute('data-id'), 10);
        const action = handle.getAttribute('data-action');
        this.startDrag(id, action, e.clientX);
        return;
      }

      // Arrastar barra inteira
      const bar = e.target.closest('.gantt-task-bar, .gantt-milestone-wrap');
      if (bar) {
        const id = parseInt(bar.getAttribute('data-id'), 10);
        State.selectTask(id);

        if (!e.target.classList.contains('inside-label')) {
          e.preventDefault();
          this.startDrag(id, 'move', e.clientX);
        }
      }
    });

    // Duplo clique na barra abre propriedades
    this.container.addEventListener('dblclick', (e) => {
      const bar = e.target.closest('[data-id]');
      if (bar) {
        const id = parseInt(bar.getAttribute('data-id'), 10);
        if (window.App) window.App.openTaskModal(id);
      }
    });
  },

  startDrag(taskId, mode, startClientX) {
    const task = State.tasks.find(t => t.id === taskId);
    if (!task || task.isSummary) return;

    this.dragging = {
      taskId,
      mode,
      startClientX,
      originalStart: task.start,
      originalEnd: task.end,
      originalDuration: task.duration
    };

    document.body.style.cursor = mode === 'move' ? 'grab' : 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (e) => {
      if (!this.dragging) return;
      const deltaX = e.clientX - this.dragging.startClientX;
      const daysShift = Math.round(deltaX / this.dayWidth);
      if (daysShift === 0) return;

      const t = State.tasks.find(taskItem => taskItem.id === this.dragging.taskId);
      if (!t) return;

      if (this.dragging.mode === 'move') {
        const dStart = ProjectEngine.parseDate(this.dragging.originalStart);
        dStart.setDate(dStart.getDate() + daysShift);
        const newStart = ProjectEngine.formatDate(dStart);
        t.start = newStart;
        t.end = ProjectEngine.addWorkDays(newStart, Math.max(1, t.duration));
      } else if (this.dragging.mode === 'resize-right') {
        const newDur = Math.max(1, this.dragging.originalDuration + daysShift);
        t.duration = newDur;
        t.end = ProjectEngine.addWorkDays(t.start, newDur);
      } else if (this.dragging.mode === 'resize-left') {
        const dStart = ProjectEngine.parseDate(this.dragging.originalStart);
        dStart.setDate(dStart.getDate() + daysShift);
        const newStart = ProjectEngine.formatDate(dStart);
        if (newStart <= t.end) {
          t.start = newStart;
          t.duration = ProjectEngine.countWorkDays(t.start, t.end);
        }
      }

      this.render();
      if (window.WBSGrid) window.WBSGrid.render();
    };

    const onMouseUp = () => {
      if (this.dragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        this.dragging = null;
        State.recalculateAndSave();
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  },

  startPinLink(fromTaskId, e) {
    const fromTask = State.tasks.find(t => t.id === fromTaskId);
    if (!fromTask) return;

    let tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tempLine.setAttribute('stroke', '#00f2fe');
    tempLine.setAttribute('stroke-width', '2.5');
    tempLine.setAttribute('stroke-dasharray', '4,3');
    this.svgLayer.appendChild(tempLine);

    const svgRect = this.svgLayer.getBoundingClientRect();
    const startX = e.clientX - svgRect.left + this.bodyWrap.scrollLeft;
    const startY = e.clientY - svgRect.top + this.bodyWrap.scrollTop;

    tempLine.setAttribute('x1', startX);
    tempLine.setAttribute('y1', startY);
    tempLine.setAttribute('x2', startX);
    tempLine.setAttribute('y2', startY);

    const onMouseMove = (moveEvt) => {
      const curX = moveEvt.clientX - svgRect.left + this.bodyWrap.scrollLeft;
      const curY = moveEvt.clientY - svgRect.top + this.bodyWrap.scrollTop;
      tempLine.setAttribute('x2', curX);
      tempLine.setAttribute('y2', curY);
    };

    const onMouseUp = (upEvt) => {
      if (tempLine.parentNode) tempLine.parentNode.removeChild(tempLine);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const targetEl = document.elementFromPoint(upEvt.clientX, upEvt.clientY);
      const targetBar = targetEl ? targetEl.closest('[data-id]') : null;
      if (targetBar) {
        const toId = parseInt(targetBar.getAttribute('data-id'), 10);
        if (toId && toId !== fromTaskId) {
          State.linkTasks(fromTaskId, toId, 'FS');
          if (window.App) window.App.showToast(`${fromTask.name} ➔ ${toId} (${I18N.t('msgTaskLinked')})`);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
};

window.GanttChart = GanttChart;
