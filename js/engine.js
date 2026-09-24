/**
 * ProjectClone - Motor de Cronograma, CPM (Caminho Crítico) e WBS
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

  isWorkDay(date) {
    const day = date.getDay();
    return this.workDays.includes(day);
  },

  getNextWorkDay(date) {
    const d = new Date(date);
    while (!this.isWorkDay(d)) {
      d.setDate(d.getDate() + 1);
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

  // Recalcular WBS, Sumários, Dependências e Caminho Crítico
  recalculateAll(projectData) {
    const tasks = projectData.tasks || [];
    if (!tasks.length) return projectData;

    // 1. Identificar Tarefas-Resumo (Fases) e calcular WBS
    this.recomputeHierarchyAndWBS(tasks);

    // 2. Resolver Dependências e ajustar datas em cascata
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

      // É resumo se a próxima tarefa tiver nível maior
      task.isSummary = !!(nextTask && (nextTask.level || 0) > level);

      // Ajusta contadores para o nível atual
      while (counters.length <= level) counters.push(0);
      counters.length = level + 1;
      counters[level]++;

      task.wbs = counters.join('.');
    }
  },

  // 2. Predecessoras e Cascata
  parsePredecessors(predStr) {
    if (!predStr || typeof predStr !== 'string') return [];
    const parts = predStr.split(/[,;]/);
    const links = [];

    for (let p of parts) {
      p = p.trim().toUpperCase();
      if (!p) continue;

      // Regex para suportar: "2", "2FS", "2SS+2", "3FF-1", "4SF"
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

    // Múltiplos passos para estabilizar cadeias de dependência
    for (let iter = 0; iter < 5; iter++) {
      let changed = false;

      for (const task of tasks) {
        if (task.isSummary) continue; // Resumo é calculado via filhos

        const links = this.parsePredecessors(task.predecessors);
        if (!links.length) continue;

        let earliestStart = task.start;

        for (const link of links) {
          const pred = map.get(link.id);
          if (!pred || !pred.end) continue;

          let targetDate;
          const predStart = this.parseDate(pred.start);
          const predEnd = this.parseDate(pred.end);

          if (link.type === 'FS') {
            // Término-Início: Inicia no próximo dia útil após o término da predecessora
            const nextDay = new Date(predEnd);
            nextDay.setDate(nextDay.getDate() + 1);
            let d = this.getNextWorkDay(nextDay);
            if (link.lag !== 0) {
              d.setDate(d.getDate() + link.lag);
              d = this.getNextWorkDay(d);
            }
            targetDate = this.formatDate(d);
          } else if (link.type === 'SS') {
            // Início-Início: Inicia junto com a predecessora
            const d = new Date(predStart);
            if (link.lag !== 0) {
              d.setDate(d.getDate() + link.lag);
              targetDate = this.formatDate(this.getNextWorkDay(d));
            } else {
              targetDate = this.formatDate(d);
            }
          } else if (link.type === 'FF') {
            // Término-Término
            const d = new Date(predEnd);
            if (link.lag !== 0) d.setDate(d.getDate() + link.lag);
            const targetEnd = this.formatDate(this.getNextWorkDay(d));
            // Calcula início subtraindo a duração
            targetDate = targetEnd; // simplificado
          } else {
            targetDate = pred.end;
          }

          if (targetDate && targetDate > earliestStart) {
            earliestStart = targetDate;
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

    // Calcula de baixo para cima (reverse)
    for (let i = tasks.length - 1; i >= 0; i--) {
      const task = tasks[i];

      // Calcula custo da própria tarefa se for folha
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

      // Se for resumo, agrega de todos os filhos diretos e indiretos
      const myLevel = task.level || 0;
      let minStart = null;
      let maxEnd = null;
      let totalDuration = 0;
      let weightedProgress = 0;
      let sumCost = 0;

      for (let j = i + 1; j < tasks.length; j++) {
        const child = tasks[j];
        if ((child.level || 0) <= myLevel) break; // Saiu do escopo desta fase

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

    // Reset
    tasks.forEach(t => t.isCritical = false);

    // Mapeamento de predecessoras e sucessoras
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

    // Encontra a data final máxima do projeto
    let maxProjectEnd = '';
    leafTasks.forEach(t => {
      if (!maxProjectEnd || t.end > maxProjectEnd) {
        maxProjectEnd = t.end;
      }
    });

    // Backward pass simplificado: tarefas que terminam no prazo final do projeto ou que alimentam tarefas críticas sem folga
    const criticalSet = new Set();

    // Tarefas terminais que terminam na data máxima
    leafTasks.forEach(t => {
      if (t.end === maxProjectEnd) {
        criticalSet.add(t.id);
      }
    });

    // Propagar para trás
    let expanded = true;
    while (expanded) {
      expanded = false;
      leafTasks.forEach(t => {
        if (criticalSet.has(t.id)) {
          const preds = this.parsePredecessors(t.predecessors);
          preds.forEach(p => {
            const predTask = idMap.get(p.id);
            if (predTask && !criticalSet.has(predTask.id)) {
              // Verifica se a folga entre o fim da pred e início da task é <= 1 dia útil
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

    // Aplica flag
    leafTasks.forEach(t => {
      if (criticalSet.has(t.id)) {
        t.isCritical = true;
      }
    });

    // Resumos que contêm tarefas críticas também marcam crítico
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
  }
};

window.ProjectEngine = ProjectEngine;
