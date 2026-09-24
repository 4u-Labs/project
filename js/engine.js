/**
 * ProjectClone - Motor de Cronograma, CPM (Caminho Crítico), WBS, Feriados e Análise de Valor Agregado (EVA)
 * Padrão PMI / PMP / Primavera P6
 */
const ProjectEngine = {
  // Configuração padrão de calendário
  workDays: [1, 2, 3, 4, 5], // Seg=1 a Sex=5
  hoursPerDay: 8,

  // Utilitários de Data
  parseDate(str) {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  },

  formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 1. Feriados Nacionais Brasileiros (Móveis e Fixos)
  getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  },

  getBrazilianHolidays(year) {
    const list = new Set();

    // Fixos
    const fixos = [
      `${year}-01-01`, // Confraternização Universal
      `${year}-04-21`, // Tiradentes
      `${year}-05-01`, // Dia do Trabalho
      `${year}-09-07`, // Independência do Brasil
      `${year}-10-12`, // Nossa Senhora Aparecida
      `${year}-11-02`, // Finados
      `${year}-11-15`, // Proclamação da República
      `${year}-11-20`, // Dia da Consciência Negra (Feriado Nacional Lei 14.759/23)
      `${year}-12-25`  // Natal
    ];
    fixos.forEach(d => list.add(d));

    // Móveis calculados a partir da Páscoa
    const easter = this.getEasterSunday(year);

    // Carnaval: -47 dias
    const carnaval = new Date(easter);
    carnaval.setDate(carnaval.getDate() - 47);
    list.add(this.formatDate(carnaval));

    // Sexta-feira Santa: -2 dias
    const sextaSanta = new Date(easter);
    sextaSanta.setDate(sextaSanta.getDate() - 2);
    list.add(this.formatDate(sextaSanta));

    // Corpus Christi: +60 dias
    const corpus = new Date(easter);
    corpus.setDate(corpus.getDate() + 60);
    list.add(this.formatDate(corpus));

    return list;
  },

  isHoliday(date) {
    if (!date) return false;
    const d = (date instanceof Date) ? date : this.parseDate(date);
    if (!d || isNaN(d.getTime())) return false;

    const calSettings = (window.State && window.State.project && window.State.project.calendarSettings) || {
      useNationalHolidays: true,
      customHolidays: []
    };

    const dateStr = this.formatDate(d);

    // Feriados customizados pelo usuário
    if (calSettings.customHolidays && calSettings.customHolidays.includes(dateStr)) {
      return true;
    }

    // Feriados nacionais
    if (calSettings.useNationalHolidays) {
      const year = d.getFullYear();
      if (!this._holidaysCache || this._holidaysCacheYear !== year) {
        this._holidaysCache = this.getBrazilianHolidays(year);
        this._holidaysCacheYear = year;
      }
      return this._holidaysCache.has(dateStr);
    }

    return false;
  },

  isWorkDay(date) {
    if (!date) return false;
    const d = (date instanceof Date) ? date : this.parseDate(date);
    if (!d || isNaN(d.getTime())) return false;

    const calSettings = (window.State && window.State.project && window.State.project.calendarSettings) || {};
    const activeWorkDays = calSettings.workDays || this.workDays;
    const day = d.getDay();

    if (!activeWorkDays.includes(day)) return false;
    if (this.isHoliday(d)) return false;

    return true;
  },

  getNextWorkDay(date) {
    const d = new Date(date);
    while (!this.isWorkDay(d)) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  },

  getPrevWorkDay(date) {
    const d = new Date(date);
    while (!this.isWorkDay(d)) {
      d.setDate(d.getDate() - 1);
    }
    return d;
  },

  addWorkDays(startDateStr, days) {
    if (days <= 0) return startDateStr;
    let d = this.parseDate(startDateStr);
    d = this.getNextWorkDay(d);
    let added = 0;
    while (added < days - 1) {
      d.setDate(d.getDate() + 1);
      if (this.isWorkDay(d)) {
        added++;
      }
    }
    return this.formatDate(d);
  },

  subtractWorkDays(dateStr, days) {
    if (days <= 0) return dateStr;
    let d = this.parseDate(dateStr);
    d = this.getPrevWorkDay(d);
    let subbed = 0;
    while (subbed < days - 1) {
      d.setDate(d.getDate() - 1);
      if (this.isWorkDay(d)) {
        subbed++;
      }
    }
    return this.formatDate(d);
  },

  countWorkDays(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return 0;
    let start = this.parseDate(startDateStr);
    let end = this.parseDate(endDateStr);
    if (start > end) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (this.isWorkDay(cur)) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  },

  // Recalcular WBS, Sumários, Restrições, Dependências e Caminho Crítico
  recalculateAll(projectData) {
    const tasks = projectData.tasks || [];
    if (!tasks.length) return projectData;

    // 1. Identificar Tarefas-Resumo (Fases) e calcular WBS
    this.recomputeHierarchyAndWBS(tasks);

    // 2. Resolver Dependências e Restrições de Tarefas (Constraints)
    this.resolveDependencies(tasks);

    // 3. Roll-up de tarefas-resumo (datas mínimas, máximas, progresso e custos)
    this.rollupSummaries(tasks, projectData.resources || []);

    // 4. Calcular Caminho Crítico (CPM)
    this.computeCriticalPath(tasks);

    return projectData;
  },

  // 1. WBS e Níveis Hierárquicos
  recomputeHierarchyAndWBS(tasks) {
    const counters = [0];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const level = task.level || 0;
      const nextTask = tasks[i + 1];

      task.isSummary = !!(nextTask && (nextTask.level || 0) > level);

      while (counters.length <= level) counters.push(0);
      counters.length = level + 1;
      counters[level]++;

      task.wbs = counters.join('.');
    }
  },

  // 2. Predecessoras e Restrições (Constraints)
  parsePredecessors(predStr) {
    if (!predStr || typeof predStr !== 'string') return [];
    const parts = predStr.split(/[,;]/);
    const links = [];

    for (let p of parts) {
      p = p.trim().toUpperCase();
      if (!p) continue;

      const match = p.match(/^(\d+)(FS|SS|FF|SF)?([+-]\d+)?$/);
      if (match) {
        links.push({
          id: parseInt(match[1], 10),
          type: match[2] || 'FS',
          lag: match[3] ? parseInt(match[3], 10) : 0
        });
      }
    }
    return links;
  },

  resolveDependencies(tasks) {
    const map = new Map();
    tasks.forEach(t => map.set(t.id, t));

    for (let iter = 0; iter < 6; iter++) {
      let changed = false;

      for (const task of tasks) {
        if (task.isSummary) continue;

        let earliestStart = task.start;

        // Tratar Restrições Rígidas de Início (MSO - Must Start On)
        if (task.constraintType === 'MSO' && task.constraintDate) {
          earliestStart = task.constraintDate;
        }

        // Avaliar dependências
        const links = this.parsePredecessors(task.predecessors);
        if (links.length) {
          for (const link of links) {
            const pred = map.get(link.id);
            if (!pred || !pred.end) continue;

            let targetDate;
            const predStart = this.parseDate(pred.start);
            const predEnd = this.parseDate(pred.end);

            if (link.type === 'FS') {
              const nextDay = new Date(predEnd);
              nextDay.setDate(nextDay.getDate() + 1);
              let d = this.getNextWorkDay(nextDay);
              if (link.lag !== 0) {
                d.setDate(d.getDate() + link.lag);
                d = this.getNextWorkDay(d);
              }
              targetDate = this.formatDate(d);
            } else if (link.type === 'SS') {
              const d = new Date(predStart);
              if (link.lag !== 0) {
                d.setDate(d.getDate() + link.lag);
                targetDate = this.formatDate(this.getNextWorkDay(d));
              } else {
                targetDate = this.formatDate(d);
              }
            } else if (link.type === 'FF') {
              const d = new Date(predEnd);
              if (link.lag !== 0) d.setDate(d.getDate() + link.lag);
              targetDate = this.formatDate(this.getNextWorkDay(d));
            } else {
              targetDate = pred.end;
            }

            if (targetDate && targetDate > earliestStart) {
              earliestStart = targetDate;
            }
          }
        }

        // Restrição SNET (Start No Earlier Than - Não iniciar antes de...)
        if (task.constraintType === 'SNET' && task.constraintDate) {
          if (task.constraintDate > earliestStart) {
            earliestStart = task.constraintDate;
          }
        }

        // Atraso de Nivelamento de Recursos (Leveling Delay)
        if (task.levelingDelay && task.levelingDelay > 0 && task.baseStart) {
          const delayStart = this.addWorkDays(task.baseStart, task.levelingDelay);
          if (delayStart > earliestStart) {
            earliestStart = delayStart;
          }
        }

        if (earliestStart !== task.start) {
          task.start = earliestStart;
          task.end = this.addWorkDays(task.start, Math.max(1, task.duration || 1));
          changed = true;
        }
      }

      if (!changed) break;
    }
  },

  // 3. Roll-up de Fases (Tarefas-Mãe)
  rollupSummaries(tasks, resources) {
    const resMap = new Map();
    (resources || []).forEach(r => resMap.set(r.id, r));

    for (let i = tasks.length - 1; i >= 0; i--) {
      const task = tasks[i];

      if (!task.isSummary) {
        let taskCost = 0;
        const assignedRes = (task.resourceIds || []).map(id => resMap.get(id)).filter(Boolean);
        const duration = Math.max(1, task.duration || 1);
        const hours = duration * this.hoursPerDay;

        assignedRes.forEach(r => {
          taskCost += (r.standardRate || 0) * hours;
        });

        if (task.fixedCost) taskCost += Number(task.fixedCost);
        task.cost = taskCost;
        continue;
      }

      const myLevel = task.level || 0;
      let minStart = null;
      let maxEnd = null;
      let totalDuration = 0;
      let weightedProgress = 0;
      let sumCost = 0;

      for (let j = i + 1; j < tasks.length; j++) {
        const child = tasks[j];
        if ((child.level || 0) <= myLevel) break;

        if (!child.isSummary) {
          if (!minStart || (child.start && child.start < minStart)) minStart = child.start;
          if (!maxEnd || (child.end && child.end > maxEnd)) maxEnd = child.end;
          
          const dur = Math.max(1, child.duration || 1);
          totalDuration += dur;
          weightedProgress += dur * (child.progress || 0);
          sumCost += (child.cost || 0);
        }
      }

      if (minStart) task.start = minStart;
      if (maxEnd) task.end = maxEnd;
      task.duration = minStart && maxEnd ? this.countWorkDays(minStart, maxEnd) : 1;
      task.progress = totalDuration > 0 ? Math.round(weightedProgress / totalDuration) : 0;
      task.cost = sumCost;
    }
  },

  // 4. Critical Path Method (CPM)
  computeCriticalPath(tasks) {
    const leafTasks = tasks.filter(t => !t.isSummary);
    if (!leafTasks.length) return;

    tasks.forEach(t => t.isCritical = false);

    const idMap = new Map();
    const successorsMap = new Map();
    leafTasks.forEach(t => {
      idMap.set(t.id, t);
      successorsMap.set(t.id, []);
    });

    leafTasks.forEach(t => {
      const preds = this.parsePredecessors(t.predecessors);
      preds.forEach(p => {
        if (successorsMap.has(p.id)) {
          successorsMap.get(p.id).push(t.id);
        }
      });
    });

    let maxProjectEnd = '';
    leafTasks.forEach(t => {
      if (!maxProjectEnd || t.end > maxProjectEnd) {
        maxProjectEnd = t.end;
      }
    });

    const criticalSet = new Set();
    leafTasks.forEach(t => {
      if (t.end === maxProjectEnd) {
        criticalSet.add(t.id);
      }
    });

    let expanded = true;
    while (expanded) {
      expanded = false;
      leafTasks.forEach(t => {
        if (criticalSet.has(t.id)) {
          const preds = this.parsePredecessors(t.predecessors);
          preds.forEach(p => {
            const predTask = idMap.get(p.id);
            if (predTask && !criticalSet.has(predTask.id)) {
              const daysDiff = this.countWorkDays(predTask.end, t.start);
              if (daysDiff <= 2) {
                criticalSet.add(predTask.id);
                expanded = true;
              }
            }
          });
        }
      });
    }

    leafTasks.forEach(t => {
      if (criticalSet.has(t.id)) {
        t.isCritical = true;
      }
    });

    tasks.forEach(t => {
      if (t.isSummary) {
        const myLevel = t.level || 0;
        const idx = tasks.indexOf(t);
        for (let j = idx + 1; j < tasks.length; j++) {
          const child = tasks[j];
          if ((child.level || 0) <= myLevel) break;
          if (child.isCritical) {
            t.isCritical = true;
            break;
          }
        }
      }
    });
  },

  // ==========================================================================
  // 5. ANÁLISE DE VALOR AGREGADO (EVA - EARNED VALUE ANALYSIS) & CURVA S
  // ==========================================================================
  computeEVA(projectData, asOfDateStr = null) {
    const tasks = projectData.tasks || [];
    const leafTasks = tasks.filter(t => !t.isSummary);
    const asOfDate = asOfDateStr || this.formatDate(new Date());

    let BAC = 0; // Budget At Completion (Orçamento total no término)
    let PV = 0;  // Planned Value (Valor Planejado)
    let EV = 0;  // Earned Value (Valor Agregado)
    let AC = 0;  // Actual Cost (Custo Real)

    leafTasks.forEach(t => {
      const taskCost = t.cost || 0;
      BAC += taskCost;

      // 1. Cálculo do PV (Valor Planejado na data de corte)
      // Se a tarefa usa baseline, calcula em cima da baseline, senão usa datas atuais
      const planStart = t.baselineStart || t.start;
      const planEnd = t.baselineEnd || t.end;

      if (planEnd && planEnd <= asOfDate) {
        // Deveria estar 100% concluída
        PV += taskCost;
      } else if (planStart && planStart <= asOfDate && planEnd && planEnd > asOfDate) {
        // Deveria estar parcialmente concluída
        const totalDur = this.countWorkDays(planStart, planEnd);
        const elapsed = this.countWorkDays(planStart, asOfDate);
        const plannedPct = totalDur > 0 ? Math.min(1.0, elapsed / totalDur) : 0;
        PV += taskCost * plannedPct;
      }

      // 2. Cálculo do EV (Valor Agregado = % Realizado * Custo Orçado)
      const actualPct = (t.progress || 0) / 100;
      EV += taskCost * actualPct;

      // 3. Cálculo do AC (Custo Real incorrido)
      // Se tiver actualCost explícito usa ele, senão calcula proporcionalmente ou com base no progresso
      if (t.actualCost !== undefined && t.actualCost !== null) {
        AC += Number(t.actualCost);
      } else {
        // Estimativa padrão: Custo proporcional com ligeira variação se estiver atrasada
        AC += taskCost * actualPct;
      }
    });

    // Variações
    const SV = EV - PV; // Schedule Variance (Variação de Prazo)
    const CV = EV - AC; // Cost Variance (Variação de Custo)

    // Índices de Desempenho
    const SPI = PV > 0 ? (EV / PV) : 1.0; // Índice de Desempenho de Prazo
    const CPI = AC > 0 ? (EV / AC) : 1.0; // Índice de Desempenho de Custo

    // Previsões no Término
    const EAC = CPI > 0 ? (BAC / CPI) : BAC; // Estimate At Completion
    const VAC = BAC - EAC; // Variance At Completion

    return {
      asOfDate,
      BAC,
      PV,
      EV,
      AC,
      SV,
      CV,
      SPI,
      CPI,
      EAC,
      VAC,
      spiStatus: SPI >= 1.0 ? 'good' : (SPI >= 0.85 ? 'warning' : 'critical'),
      cpiStatus: CPI >= 1.0 ? 'good' : (CPI >= 0.85 ? 'warning' : 'critical')
    };
  },

  // Gerador de pontos para o gráfico da Curva S
  generateSCurveSeries(projectData, numPoints = 20) {
    const tasks = projectData.tasks || [];
    const leafTasks = tasks.filter(t => !t.isSummary);
    if (!leafTasks.length) return { points: [], BAC: 0 };

    let minD = '';
    let maxD = '';
    let BAC = 0;

    leafTasks.forEach(t => {
      BAC += (t.cost || 0);
      const s = t.baselineStart || t.start;
      const e = t.baselineEnd || t.end;
      if (s && (!minD || s < minD)) minD = s;
      if (e && (!maxD || e > maxD)) maxD = e;
    });

    if (!minD || !maxD) return { points: [], BAC: 0 };

    const startDate = this.parseDate(minD);
    const endDate = this.parseDate(maxD);
    const todayStr = this.formatDate(new Date());

    const totalDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const stepDays = Math.max(1, Math.round(totalDays / (numPoints - 1)));

    const points = [];
    let curDate = new Date(startDate);

    for (let i = 0; i < numPoints; i++) {
      if (curDate > endDate && i === numPoints - 1) curDate = new Date(endDate);
      const dateStr = this.formatDate(curDate);
      const isPastOrToday = dateStr <= todayStr;

      let plannedCum = 0;
      let earnedCum = 0;
      let actualCum = 0;

      leafTasks.forEach(t => {
        const cost = t.cost || 0;
        const pStart = t.baselineStart || t.start;
        const pEnd = t.baselineEnd || t.end;

        // Planejado até dateStr
        if (pEnd && pEnd <= dateStr) {
          plannedCum += cost;
        } else if (pStart && pStart <= dateStr && pEnd && pEnd > dateStr) {
          const tot = this.countWorkDays(pStart, pEnd);
          const el = this.countWorkDays(pStart, dateStr);
          plannedCum += cost * (tot > 0 ? el / tot : 0);
        }

        // Realizado até dateStr (apenas se a data for até hoje)
        if (isPastOrToday) {
          if (t.end && t.end <= dateStr) {
            earnedCum += cost * ((t.progress || 0) / 100);
          } else if (t.start && t.start <= dateStr) {
            earnedCum += cost * ((t.progress || 0) / 100);
          }
          actualCum = earnedCum * 0.98; // aproximação de custo real
        }
      });

      points.push({
        date: dateStr,
        label: `${curDate.getDate()}/${curDate.getMonth() + 1}`,
        isPastOrToday,
        planned: plannedCum,
        plannedPct: BAC > 0 ? Math.round((plannedCum / BAC) * 100) : 0,
        earned: isPastOrToday ? earnedCum : null,
        earnedPct: isPastOrToday && BAC > 0 ? Math.round((earnedCum / BAC) * 100) : null,
        actual: isPastOrToday ? actualCum : null
      });

      curDate.setDate(curDate.getDate() + stepDays);
      if (curDate > endDate && i < numPoints - 2) {
        curDate = new Date(endDate);
      }
    }

    return { points, BAC, todayStr };
  },

  // 7. Gestão Avançada de Equipe & Histograma de Carga
  computeResourceWorkload(projectData) {
    const tasks = projectData.tasks || [];
    const resources = projectData.resources || [];
    const hoursPerDay = this.hoursPerDay || 8;

    const leafTasks = tasks.filter(t => !t.isSummary && t.start && t.end);
    const resMap = new Map();

    resources.forEach(r => {
      resMap.set(r.id, {
        id: r.id,
        name: r.name,
        role: r.role || '',
        type: r.type || 'work',
        standardRate: r.standardRate || 0,
        maxUnits: r.maxUnits || 100,
        maxHoursPerDay: ((r.maxUnits || 100) / 100) * hoursPerDay,
        totalHours: 0,
        peakHours: 0,
        peakPct: 0,
        isOverallocated: false,
        overallocatedDaysCount: 0,
        dailyWorkload: {},
        conflicts: []
      });
    });

    if (!leafTasks.length || !resources.length) {
      return {
        resources: Array.from(resMap.values()),
        totalOverallocatedResources: 0,
        totalConflicts: 0,
        totalHours: 0
      };
    }

    let minDateStr = leafTasks[0].start;
    let maxDateStr = leafTasks[0].end;
    leafTasks.forEach(t => {
      if (t.start && t.start < minDateStr) minDateStr = t.start;
      if (t.end && t.end > maxDateStr) maxDateStr = t.end;
    });

    leafTasks.forEach(task => {
      if (!task.resourceIds || !task.resourceIds.length) return;
      const dailyHoursForTask = hoursPerDay;

      let cur = this.parseDate(task.start);
      const endD = this.parseDate(task.end);

      while (cur <= endD) {
        if (this.isWorkDay(cur)) {
          const dStr = this.formatDate(cur);

          task.resourceIds.forEach(resId => {
            const resObj = resMap.get(resId);
            if (!resObj) return;

            if (!resObj.dailyWorkload[dStr]) {
              resObj.dailyWorkload[dStr] = {
                date: dStr,
                hours: 0,
                pct: 0,
                tasks: []
              };
            }

            resObj.dailyWorkload[dStr].hours += dailyHoursForTask;
            resObj.dailyWorkload[dStr].tasks.push({
              id: task.id,
              name: task.name,
              start: task.start,
              end: task.end,
              isCritical: !!task.isCritical
            });
            resObj.totalHours += dailyHoursForTask;
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    });

    let totalConflicts = 0;
    let totalOverallocatedResources = 0;
    let grandTotalHours = 0;

    resMap.forEach(resObj => {
      grandTotalHours += resObj.totalHours;

      for (const [dateStr, dayData] of Object.entries(resObj.dailyWorkload)) {
        dayData.pct = resObj.maxHoursPerDay > 0 
          ? Math.round((dayData.hours / resObj.maxHoursPerDay) * 100) 
          : 0;

        if (dayData.hours > resObj.peakHours) {
          resObj.peakHours = dayData.hours;
          resObj.peakPct = dayData.pct;
        }

        if (dayData.hours > resObj.maxHoursPerDay) {
          resObj.isOverallocated = true;
          resObj.overallocatedDaysCount++;
          resObj.conflicts.push({
            date: dateStr,
            hours: dayData.hours,
            pct: dayData.pct,
            tasks: dayData.tasks
          });
          totalConflicts++;
        }
      }

      if (resObj.isOverallocated) {
        totalOverallocatedResources++;
      }
    });

    return {
      resources: Array.from(resMap.values()),
      totalOverallocatedResources,
      totalConflicts,
      totalHours: grandTotalHours,
      dateRange: { start: minDateStr, end: maxDateStr }
    };
  },

  // 8. Nivelamento Automático de Recursos (Resource Leveling)
  levelResources(projectData) {
    const tasks = projectData.tasks || [];
    const resources = projectData.resources || [];
    const initialEnd = tasks.reduce((max, t) => (!max || (t.end && t.end > max) ? t.end : max), '');

    const shiftedTasks = [];
    const maxIterations = 20;
    let iteration = 0;
    let totalResolved = 0;

    while (iteration < maxIterations) {
      iteration++;
      this.resolveDependencies(tasks);
      this.computeCriticalPath(tasks);

      const workload = this.computeResourceWorkload({ tasks, resources });
      if (workload.totalOverallocatedResources === 0) {
        break;
      }

      let madeProgress = false;

      for (const res of workload.resources) {
        if (!res.isOverallocated || !res.conflicts.length) continue;

        const conflict = res.conflicts[0];
        const conflictTasks = conflict.tasks;
        if (conflictTasks.length < 2) continue;

        const fullTasks = conflictTasks.map(ct => tasks.find(t => t.id === ct.id)).filter(Boolean);
        if (fullTasks.length < 2) continue;

        // Ordenação por prioridade:
        // 1. Maior progresso (%) já executado
        // 2. Caminho crítico preservado
        // 3. Menor data de início inicial
        // 4. Menor ID
        fullTasks.sort((a, b) => {
          if ((b.progress || 0) !== (a.progress || 0)) return (b.progress || 0) - (a.progress || 0);
          if (b.isCritical !== a.isCritical) return b.isCritical ? 1 : -1;
          if (a.start !== b.start) return a.start < b.start ? -1 : 1;
          return a.id - b.id;
        });

        const primary = fullTasks[0];
        const secondary = fullTasks[1];

        const primaryEnd = this.parseDate(primary.end);
        const dayAfter = new Date(primaryEnd);
        dayAfter.setDate(dayAfter.getDate() + 1);
        const nextWork = this.formatDate(this.getNextWorkDay(dayAfter));

        if (nextWork > secondary.start) {
          const oldStart = secondary.start;
          const workDaysDiff = this.countWorkDays(secondary.start, nextWork) - 1;
          const delayToAdd = Math.max(1, workDaysDiff);

          secondary.baseStart = secondary.baseStart || secondary.start;
          secondary.levelingDelay = (secondary.levelingDelay || 0) + delayToAdd;

          secondary.start = nextWork;
          secondary.end = this.addWorkDays(secondary.start, Math.max(1, secondary.duration || 1));

          shiftedTasks.push({
            taskId: secondary.id,
            taskName: secondary.name,
            resourceName: res.name,
            oldStart,
            newStart: secondary.start,
            daysShifted: delayToAdd
          });

          totalResolved++;
          madeProgress = true;
          this.resolveDependencies(tasks);
          break;
        }
      }

      if (!madeProgress) break;
    }

    this.resolveDependencies(tasks);
    this.computeCriticalPath(tasks);
    this.rollupSummaries(tasks, resources);

    const finalEnd = tasks.reduce((max, t) => (!max || (t.end && t.end > max) ? t.end : max), '');

    return {
      success: true,
      iterations: iteration,
      resolvedConflicts: totalResolved,
      shiftedTasks,
      initialEnd,
      finalEnd
    };
  },

  // 9. Desfazer / Limpar Nivelamento
  clearLeveling(projectData) {
    const tasks = projectData.tasks || [];
    tasks.forEach(t => {
      t.levelingDelay = 0;
      if (t.baseStart) {
        t.start = t.baseStart;
        delete t.baseStart;
      }
    });
    this.resolveDependencies(tasks);
    this.computeCriticalPath(tasks);
    this.rollupSummaries(tasks, projectData.resources || []);
  }
};

window.ProjectEngine = ProjectEngine;

