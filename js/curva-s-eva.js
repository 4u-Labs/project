/**
 * ProjectClone - Curva S Físico-Financeira & Análise de Valor Agregado (EVA)
 * Padrão PMI / PMP / Primavera P6
 */

const CurvaSEvaView = {
  container: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    State.eventBus.on('tasksUpdated', () => {
      if (State.project.view === 'curvaS') this.render();
    });
    State.eventBus.on('viewChanged', (view) => {
      if (view === 'curvaS') this.render();
    });
    State.eventBus.on('langChanged', () => {
      if (State.project.view === 'curvaS') this.render();
    });

    this.bindEvents();
  },

  render() {
    if (!this.container) return;

    const eva = ProjectEngine.computeEVA({
      tasks: State.tasks,
      resources: State.resources
    });

    const sCurve = ProjectEngine.generateSCurveSeries({
      tasks: State.tasks,
      resources: State.resources
    }, 22);

    const currency = State.project.currency || 'BRL';
    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val || 0);

    // Indicadores visuais
    const spiCls = eva.SPI >= 1.0 ? 'eva-good' : (eva.SPI >= 0.88 ? 'eva-warn' : 'eva-crit');
    const cpiCls = eva.CPI >= 1.0 ? 'eva-good' : (eva.CPI >= 0.88 ? 'eva-warn' : 'eva-crit');

    const spiLabel = eva.SPI >= 1.0 ? `Adiantado (+${Math.round((eva.SPI - 1) * 100)}%)` : `Atrasado (-${Math.round((1 - eva.SPI) * 100)}%)`;
    const cpiLabel = eva.CPI >= 1.0 ? `Econômico (+${Math.round((eva.CPI - 1) * 100)}%)` : `Estouro (-${Math.round((1 - eva.CPI) * 100)}%)`;

    this.container.innerHTML = `
      <div class="eva-view-wrap">
        <!-- Header da Análise -->
        <div class="eva-header">
          <div>
            <h2>📈 Curva S & Análise de Valor Agregado (EVA)</h2>
            <span class="eva-subtitle">Engenharia de Custos e Prazos — Padrão PMI / PMP / Primavera P6</span>
          </div>
          <div class="eva-date-badge">
            <span>Data de Status (Hoje): <strong>${eva.asOfDate}</strong></span>
          </div>
        </div>

        <!-- 4 Cartões de Métricas EVA -->
        <div class="eva-cards-grid">
          <!-- Card 1: SPI (Desempenho de Prazos) -->
          <div class="eva-metric-card ${spiCls}">
            <div class="eva-card-header">
              <span class="eva-card-title">SPI (IDP) • Índice de Prazo</span>
              <span class="eva-formula">EV ÷ PV</span>
            </div>
            <div class="eva-value-row">
              <span class="eva-big-number">${eva.SPI.toFixed(2)}</span>
              <span class="eva-status-pill ${spiCls}">${spiLabel}</span>
            </div>
            <div class="eva-card-sub">
              <span>Variação de Prazo (SV): <strong>${fmt(eva.SV)}</strong></span>
            </div>
          </div>

          <!-- Card 2: CPI (Desempenho de Custos) -->
          <div class="eva-metric-card ${cpiCls}">
            <div class="eva-card-header">
              <span class="eva-card-title">CPI (IDC) • Índice de Custo</span>
              <span class="eva-formula">EV ÷ AC</span>
            </div>
            <div class="eva-value-row">
              <span class="eva-big-number">${eva.CPI.toFixed(2)}</span>
              <span class="eva-status-pill ${cpiCls}">${cpiLabel}</span>
            </div>
            <div class="eva-card-sub">
              <span>Variação de Custo (CV): <strong>${fmt(eva.CV)}</strong></span>
            </div>
          </div>

          <!-- Card 3: Valores Acumulados Atuais -->
          <div class="eva-metric-card">
            <div class="eva-card-header">
              <span class="eva-card-title">Valores na Data de Status</span>
              <span class="eva-formula">VP • VA • CR</span>
            </div>
            <div class="eva-summary-list">
              <div class="eva-sum-item">
                <span>Planejado (PV / VP):</span>
                <strong>${fmt(eva.PV)}</strong>
              </div>
              <div class="eva-sum-item">
                <span>Agregado (EV / VA):</span>
                <strong style="color: var(--ms-green);">${fmt(eva.EV)}</strong>
              </div>
              <div class="eva-sum-item">
                <span>Custo Real (AC / CR):</span>
                <strong style="color: var(--accent-orange);">${fmt(eva.AC)}</strong>
              </div>
            </div>
          </div>

          <!-- Card 4: Previsão no Término (EAC & VAC) -->
          <div class="eva-metric-card">
            <div class="eva-card-header">
              <span class="eva-card-title">Previsão no Término</span>
              <span class="eva-formula">BAC vs EAC</span>
            </div>
            <div class="eva-summary-list">
              <div class="eva-sum-item">
                <span>Orçamento Total (BAC):</span>
                <strong>${fmt(eva.BAC)}</strong>
              </div>
              <div class="eva-sum-item">
                <span>Projeção Final (EAC):</span>
                <strong style="color: ${eva.EAC > eva.BAC ? 'var(--accent-red)' : 'var(--ms-green)'};">${fmt(eva.EAC)}</strong>
              </div>
              <div class="eva-sum-item">
                <span>Saldo Projetado (VAC):</span>
                <strong style="color: ${eva.VAC < 0 ? 'var(--accent-red)' : 'var(--ms-green)'};">${fmt(eva.VAC)}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico Vetorial Interativo da Curva S -->
        <div class="s-curve-chart-panel">
          <div class="chart-panel-header">
            <h3>📈 Curva S Físico-Financeira Acumulada</h3>
            <div class="chart-legend">
              <div class="leg-item"><span class="leg-color leg-planned"></span> <span>Planejado (PV / Baseline)</span></div>
              <div class="leg-item"><span class="leg-color leg-earned"></span> <span>Realizado (EV / Físico)</span></div>
              <div class="leg-item"><span class="leg-color leg-actual"></span> <span>Custo Real (AC)</span></div>
              <div class="leg-item"><span class="leg-color leg-today"></span> <span>Status (Hoje)</span></div>
            </div>
          </div>

          <div class="s-curve-svg-container" id="sCurveSvgWrap">
            ${this.renderSCurveSvg(sCurve)}
          </div>
        </div>

        <!-- Tabela de Valor Agregado por Fase -->
        <div class="eva-phases-panel">
          <h3>🏗️ Desempenho EVA por Fases do Projeto</h3>
          ${this.renderPhasesTable(currency)}
        </div>
      </div>
    `;
  },

  renderSCurveSvg(sCurve) {
    const points = sCurve.points || [];
    if (points.length < 2) {
      return '<div style="text-align: center; padding: 3rem; color: #888;">Dados insuficientes para desenhar a Curva S. Adicione tarefas e custos.</div>';
    }

    const W = 960;
    const H = 340;
    const padL = 60;
    const padR = 40;
    const padT = 30;
    const padB = 40;

    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Constrói caminhos SVG
    let plannedPath = '';
    let earnedPath = '';
    let actualPath = '';
    let todayX = null;

    points.forEach((p, i) => {
      const x = padL + (i / (points.length - 1)) * plotW;
      const yPlanned = padT + plotH - (p.plannedPct / 100) * plotH;

      if (i === 0) {
        plannedPath += `M ${x} ${yPlanned}`;
      } else {
        plannedPath += ` L ${x} ${yPlanned}`;
      }

      if (p.isPastOrToday && p.earnedPct !== null) {
        const yEarned = padT + plotH - (p.earnedPct / 100) * plotH;
        if (!earnedPath) earnedPath += `M ${x} ${yEarned}`;
        else earnedPath += ` L ${x} ${yEarned}`;

        if (p.actual !== null && sCurve.BAC > 0) {
          const actualPct = Math.min(100, (p.actual / sCurve.BAC) * 100);
          const yActual = padT + plotH - (actualPct / 100) * plotH;
          if (!actualPath) actualPath += `M ${x} ${yActual}`;
          else actualPath += ` L ${x} ${yActual}`;
        }

        todayX = x;
      }
    });

    // Linhas de Grade Y (0%, 25%, 50%, 75%, 100%)
    let gridLines = '';
    for (let pct = 0; pct <= 100; pct += 25) {
      const y = padT + plotH - (pct / 100) * plotH;
      gridLines += `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${padL - 10}" y="${y + 4}" fill="#8b949e" font-size="11" text-anchor="end">${pct}%</text>
      `;
    }

    // Eixo X Labels
    let xLabels = '';
    const stepLabel = Math.max(1, Math.floor(points.length / 7));
    points.forEach((p, idx) => {
      if (idx % stepLabel === 0 || idx === points.length - 1) {
        const x = padL + (idx / (points.length - 1)) * plotW;
        xLabels += `
          <line x1="${x}" y1="${padT + plotH}" x2="${x}" y2="${padT + plotH + 5}" stroke="#8b949e" />
          <text x="${x}" y="${padT + plotH + 20}" fill="#8b949e" font-size="11" text-anchor="middle">${p.label}</text>
        `;
      }
    });

    return `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="340" class="s-curve-svg">
        <defs>
          <linearGradient id="earnedAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#107c41" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#107c41" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Grade e Eixos -->
        ${gridLines}
        ${xLabels}

        <!-- Linha de Hoje (Status) -->
        ${todayX !== null ? `
          <line x1="${todayX}" y1="${padT}" x2="${todayX}" y2="${padT + plotH}" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,3" />
          <rect x="${todayX - 25}" y="${padT - 20}" width="50" height="18" rx="4" fill="#f43f5e" />
          <text x="${todayX}" y="${padT - 7}" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">HOJE</text>
        ` : ''}

        <!-- Curva Planejada (PV - Azul tracejada) -->
        <path d="${plannedPath}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" opacity="0.9" />

        <!-- Curva Realizada (EV - Verde esmeralda sólida) -->
        ${earnedPath ? `
          <path d="${earnedPath}" fill="none" stroke="#107c41" stroke-width="3.5" />
        ` : ''}

        <!-- Custo Real (AC - Amarelo/Laranja) -->
        ${actualPath ? `
          <path d="${actualPath}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="2,2" />
        ` : ''}

        <!-- Pontos na Curva Realizada -->
        ${points.filter(p => p.isPastOrToday && p.earnedPct !== null).map((p, idx) => {
          const x = padL + (points.indexOf(p) / (points.length - 1)) * plotW;
          const yEarned = padT + plotH - (p.earnedPct / 100) * plotH;
          return `<circle cx="${x}" cy="${yEarned}" r="4" fill="#107c41" stroke="#fff" stroke-width="1.5" />`;
        }).join('')}
      </svg>
    `;
  },

  renderPhasesTable(currency) {
    const tasks = State.tasks || [];
    const mainPhases = tasks.filter(t => t.level === 0 && t.isSummary);
    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val || 0);

    if (!mainPhases.length) {
      return '<p class="text-muted">Nenhuma fase macro encontrada. Crie fases usando a EAP.</p>';
    }

    let rowsHtml = '';
    mainPhases.forEach(p => {
      const idx = tasks.indexOf(p);
      let phaseCost = 0;
      let phaseEarned = 0;

      for (let j = idx + 1; j < tasks.length; j++) {
        const child = tasks[j];
        if ((child.level || 0) <= p.level) break;
        if (!child.isSummary) {
          const c = child.cost || 0;
          phaseCost += c;
          phaseEarned += c * ((child.progress || 0) / 100);
        }
      }

      const phasePv = phaseCost; // simplificado
      const spi = phasePv > 0 ? (phaseEarned / phasePv) : 1.0;
      const spiCls = spi >= 1.0 ? 'badge-good' : (spi >= 0.85 ? 'badge-warn' : 'badge-crit');

      rowsHtml += `
        <tr>
          <td><strong>${p.wbs || ''}</strong></td>
          <td><strong>${p.name}</strong></td>
          <td style="text-align: right;">${fmt(phaseCost)}</td>
          <td style="text-align: right;">${fmt(phaseEarned)}</td>
          <td style="text-align: center;"><strong>${p.progress}%</strong></td>
          <td style="text-align: center;"><span class="eva-tag ${spiCls}">SPI ${spi.toFixed(2)}</span></td>
          <td style="text-align: left;">
            ${p.progress >= 100 ? '✅ Concluída' : (spi >= 1.0 ? '🟢 No Prazo / Adiantada' : '🔴 Exige Atenção de Prazo')}
          </td>
        </tr>
      `;
    });

    return `
      <table class="eva-table">
        <thead>
          <tr>
            <th style="width: 70px;">WBS</th>
            <th>Fase do Projeto</th>
            <th style="width: 140px; text-align: right;">Orçamento (BAC)</th>
            <th style="width: 140px; text-align: right;">Valor Agregado (EV)</th>
            <th style="width: 100px; text-align: center;">% Físico</th>
            <th style="width: 110px; text-align: center;">SPI</th>
            <th style="width: 200px;">Diagnóstico PMI</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  },

  bindEvents() {
    // Eventos futuros de filtro ou drill-down
  }
};

window.CurvaSEvaView = CurvaSEvaView;
