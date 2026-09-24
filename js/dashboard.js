/**
 * ProjectClone - Painel Executivo & Dashboard de KPIs
 */

const DashboardView = {
  container: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    State.eventBus.on('tasksUpdated', () => {
      if (State.project.view === 'dashboard') this.render();
    });
    State.eventBus.on('viewChanged', (view) => {
      if (view === 'dashboard') this.render();
    });
    State.eventBus.on('langChanged', () => {
      if (State.project.view === 'dashboard') this.render();
    });
  },

  render() {
    if (!this.container) return;

    const tasks = State.tasks || [];
    const leafTasks = tasks.filter(t => !t.isSummary);
    const todayStr = ProjectEngine.formatDate(new Date());

    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let delayedCount = 0;
    let totalWorkDays = 0;
    let weightedProgressSum = 0;
    let totalCost = 0;
    let maxFinishDate = '';
    const criticalTasks = [];

    leafTasks.forEach(t => {
      const dur = Math.max(1, t.duration || 1);
      totalWorkDays += dur;
      weightedProgressSum += dur * (t.progress || 0);
      totalCost += (t.cost || 0);

      if (t.end && (!maxFinishDate || t.end > maxFinishDate)) {
        maxFinishDate = t.end;
      }

      if (t.progress >= 100) {
        completedCount++;
      } else if (t.progress > 0) {
        inProgressCount++;
      } else {
        notStartedCount++;
      }

      // Atrasadas: prazo de fim anterior a hoje e ainda não concluída
      if (t.end && t.end < todayStr && t.progress < 100) {
        delayedCount++;
      }

      if (t.isCritical) {
        criticalTasks.push(t);
      }
    });

    const overallPct = totalWorkDays > 0 ? Math.round(weightedProgressSum / totalWorkDays) : 0;
    const costFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: State.project.currency || 'BRL' }).format(totalCost);

    // Identificar fases principais para gráfico de barras de custo
    const mainPhases = tasks.filter(t => t.level === 0 && t.isSummary);

    this.container.innerHTML = `
      <div class="dashboard-wrap">
        <div class="dashboard-header">
          <h2>📈 ${I18N.t('viewDashboard')} — ${State.project.name}</h2>
          <span class="dash-subtitle">Visão executiva de desempenho, prazos, custos e riscos</span>
        </div>

        <!-- Cartões de KPIs Principais -->
        <div class="kpi-grid">
          <div class="kpi-card card-progress">
            <div class="kpi-icon">🎯</div>
            <div class="kpi-content">
              <span class="kpi-title">${I18N.t('kpiOverallProgress')}</span>
              <span class="kpi-value">${overallPct}%</span>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill" style="width: ${overallPct}%;"></div>
              </div>
            </div>
          </div>

          <div class="kpi-card card-tasks">
            <div class="kpi-icon">📊</div>
            <div class="kpi-content">
              <span class="kpi-title">${I18N.t('kpiTotalTasks')}</span>
              <span class="kpi-value">${leafTasks.length}</span>
              <span class="kpi-sub">${completedCount} concluídas | ${inProgressCount} ativas</span>
            </div>
          </div>

          <div class="kpi-card card-delayed ${delayedCount > 0 ? 'alert' : ''}">
            <div class="kpi-icon">${delayedCount > 0 ? '⚠️' : '✅'}</div>
            <div class="kpi-content">
              <span class="kpi-title">${I18N.t('kpiDelayedTasks')}</span>
              <span class="kpi-value">${delayedCount}</span>
              <span class="kpi-sub">${delayedCount > 0 ? 'Atenção aos prazos vencidos' : 'Cronograma em dia'}</span>
            </div>
          </div>

          <div class="kpi-card card-cost">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
              <span class="kpi-title">${I18N.t('kpiTotalCost')}</span>
              <span class="kpi-value">${costFmt}</span>
              <span class="kpi-sub">${State.resources.length} recursos alocados</span>
            </div>
          </div>

          <div class="kpi-card card-finish">
            <div class="kpi-icon">📅</div>
            <div class="kpi-content">
              <span class="kpi-title">${I18N.t('kpiProjectEnd')}</span>
              <span class="kpi-value date-val">${maxFinishDate || '-'}</span>
              <span class="kpi-sub">${totalWorkDays} dias úteis de trabalho</span>
            </div>
          </div>
        </div>

        <!-- Seção de Gráficos e Riscos -->
        <div class="dashboard-details-grid">
          <!-- Distribuição do Status -->
          <div class="dash-panel">
            <h3>📊 Distribuição de Tarefas</h3>
            <div class="status-bars-container">
              <div class="status-row">
                <span class="status-name">✅ Concluídas (${completedCount})</span>
                <div class="status-track"><div class="status-fill bg-success" style="width: ${leafTasks.length ? (completedCount / leafTasks.length) * 100 : 0}%;"></div></div>
              </div>
              <div class="status-row">
                <span class="status-name">⏳ Em Andamento (${inProgressCount})</span>
                <div class="status-track"><div class="status-fill bg-warning" style="width: ${leafTasks.length ? (inProgressCount / leafTasks.length) * 100 : 0}%;"></div></div>
              </div>
              <div class="status-row">
                <span class="status-name">⚪ A Fazer (${notStartedCount})</span>
                <div class="status-track"><div class="status-fill bg-info" style="width: ${leafTasks.length ? (notStartedCount / leafTasks.length) * 100 : 0}%;"></div></div>
              </div>
              <div class="status-row">
                <span class="status-name">⚠️ Atrasadas (${delayedCount})</span>
                <div class="status-track"><div class="status-fill bg-danger" style="width: ${leafTasks.length ? (delayedCount / leafTasks.length) * 100 : 0}%;"></div></div>
              </div>
            </div>
          </div>

          <!-- Tarefas no Caminho Crítico -->
          <div class="dash-panel">
            <h3>🔥 Caminho Crítico (Sem Folga: Impactam a Data Final)</h3>
            <div class="critical-tasks-list">
              ${criticalTasks.length ? criticalTasks.map(t => `
                <div class="crit-item">
                  <span class="crit-id">${t.wbs || t.id}</span>
                  <span class="crit-name">${t.name}</span>
                  <span class="crit-dates">${t.start} ➔ ${t.end}</span>
                  <span class="crit-pct">${t.progress}%</span>
                </div>
              `).join('') : '<p class="text-muted">Nenhuma tarefa crítica detectada.</p>'}
            </div>
          </div>
        </div>

        <!-- Custos por Fase -->
        ${mainPhases.length ? `
          <div class="dash-panel" style="margin-top: 1.5rem;">
            <h3>🏗️ Orçamento por Fases do Projeto</h3>
            <div class="phase-costs-grid">
              ${mainPhases.map(p => {
                const phaseFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: State.project.currency || 'BRL' }).format(p.cost || 0);
                const costPct = totalCost > 0 ? Math.round(((p.cost || 0) / totalCost) * 100) : 0;
                return `
                  <div class="phase-cost-item">
                    <div class="phase-cost-header">
                      <strong>${p.name}</strong>
                      <span>${phaseFmt} (${costPct}%)</span>
                    </div>
                    <div class="status-track">
                      <div class="status-fill bg-primary" style="width: ${costPct}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
};

window.DashboardView = DashboardView;
