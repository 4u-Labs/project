/**
 * ProjectClone - Visualização em Calendário Mensal
 */

const CalendarView = {
  container: null,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    State.eventBus.on('tasksUpdated', () => {
      if (State.project.view === 'calendar') this.render();
    });
    State.eventBus.on('viewChanged', (view) => {
      if (view === 'calendar') this.render();
    });
    State.eventBus.on('langChanged', () => {
      if (State.project.view === 'calendar') this.render();
    });

    this.bindEvents();
  },

  render() {
    if (!this.container) return;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const todayStr = ProjectEngine.formatDate(new Date());
    const tasks = (State.tasks || []).filter(t => !t.isSummary && t.start && t.end);

    let cellsHtml = '';

    // Dias do mês anterior para preenchimento
    for (let i = 0; i < startWeekday; i++) {
      cellsHtml += `<div class="cal-day cal-day-empty"></div>`;
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(this.currentYear, this.currentMonth, d);
      const curDateStr = ProjectEngine.formatDate(curDate);
      const isToday = curDateStr === todayStr;
      const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

      // Tarefas ativas nesta data
      const activeTasks = tasks.filter(t => curDateStr >= t.start && curDateStr <= t.end);

      const taskPills = activeTasks.map(t => {
        const isCrit = t.isCritical && State.project.showCriticalPath;
        const isMilestone = t.milestone || t.duration === 0;
        let cls = 'cal-task-pill';
        if (t.progress >= 100) cls += ' pill-done';
        if (isCrit) cls += ' pill-crit';
        if (isMilestone) cls += ' pill-milestone';

        return `<div class="${cls}" data-id="${t.id}" title="${t.name} (${t.progress}%)">${isMilestone ? '💎 ' : ''}${t.name}</div>`;
      }).join('');

      cellsHtml += `
        <div class="cal-day ${isToday ? 'cal-day-today' : ''} ${isWeekend ? 'cal-day-weekend' : ''}">
          <div class="cal-day-header">
            <span class="cal-day-number">${d}</span>
            ${isToday ? '<span class="cal-today-badge">HOJE</span>' : ''}
          </div>
          <div class="cal-day-tasks">${taskPills}</div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="calendar-wrap">
        <div class="cal-nav-bar">
          <div class="cal-nav-title">
            <h2>📅 ${monthNames[this.currentMonth]} ${this.currentYear}</h2>
          </div>
          <div class="cal-nav-buttons">
            <button class="btn-cal-nav" id="btnCalPrev">◀ Mês Anterior</button>
            <button class="btn-cal-nav" id="btnCalToday">Hoje</button>
            <button class="btn-cal-nav" id="btnCalNext">Próximo Mês ▶</button>
          </div>
        </div>

        <div class="cal-grid-header">
          ${dayNames.map(d => `<div class="cal-col-header">${d}</div>`).join('')}
        </div>

        <div class="cal-grid-body">
          ${cellsHtml}
        </div>
      </div>
    `;
  },

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target.id === 'btnCalPrev') {
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
        this.render();
      } else if (e.target.id === 'btnCalNext') {
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
        this.render();
      } else if (e.target.id === 'btnCalToday') {
        const now = new Date();
        this.currentYear = now.getFullYear();
        this.currentMonth = now.getMonth();
        this.render();
      }

      const pill = e.target.closest('.cal-task-pill');
      if (pill) {
        const id = parseInt(pill.getAttribute('data-id'), 10);
        if (window.App) window.App.openTaskModal(id);
      }
    });
  }
};

window.CalendarView = CalendarView;
