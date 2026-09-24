/**
 * ProjectClone - Importador / Exportador (Microsoft Project XML, JSON, CSV e PDF)
 */

const ProjectIO = {
  // 1. Exportar para Microsoft Project XML
  exportMsProjectXml() {
    const project = State.project;
    const tasks = State.tasks || [];

    const nowIso = new Date().toISOString();
    const projStart = (project.startDate || tasks[0]?.start || ProjectEngine.formatDate(new Date())) + 'T08:00:00';

    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xml += `<Project xmlns="http://schemas.microsoft.com/project">\n`;
    xml += `  <SaveVersion>14</SaveVersion>\n`;
    xml += `  <Name>${this.escapeXml(project.name)}</Name>\n`;
    xml += `  <CreationDate>${nowIso}</CreationDate>\n`;
    xml += `  <LastSaved>${nowIso}</LastSaved>\n`;
    xml += `  <StartDate>${projStart}</StartDate>\n`;
    xml += `  <ScheduleFromStart>1</ScheduleFromStart>\n`;
    xml += `  <CalendarUID>1</CalendarUID>\n`;
    xml += `  <Tasks>\n`;

    tasks.forEach(t => {
      const durHours = (t.duration || 0) * (ProjectEngine.hoursPerDay || 8);
      const isMilestone = t.milestone || t.duration === 0 ? 1 : 0;
      const isSummary = t.isSummary ? 1 : 0;
      const level = (t.level || 0) + 1;
      const startIso = (t.start || ProjectEngine.formatDate(new Date())) + 'T08:00:00';
      const finishIso = (t.end || t.start || ProjectEngine.formatDate(new Date())) + 'T17:00:00';

      xml += `    <Task>\n`;
      xml += `      <UID>${t.id}</UID>\n`;
      xml += `      <ID>${t.id}</ID>\n`;
      xml += `      <Name>${this.escapeXml(t.name)}</Name>\n`;
      xml += `      <OutlineLevel>${level}</OutlineLevel>\n`;
      xml += `      <OutlineNumber>${t.wbs || t.id}</OutlineNumber>\n`;
      xml += `      <Start>${startIso}</Start>\n`;
      xml += `      <Finish>${finishIso}</Finish>\n`;
      xml += `      <Duration>PT${durHours}H0M0S</Duration>\n`;
      xml += `      <PercentComplete>${t.progress || 0}</PercentComplete>\n`;
      xml += `      <Milestone>${isMilestone}</Milestone>\n`;
      xml += `      <Summary>${isSummary}</Summary>\n`;

      if (t.predecessors) {
        const preds = ProjectEngine.parsePredecessors(t.predecessors);
        preds.forEach(p => {
          let linkType = 1; // 1 = Finish-to-Start (FS)
          if (p.type === 'SS') linkType = 2;
          else if (p.type === 'FF') linkType = 3;
          else if (p.type === 'SF') linkType = 0;

          xml += `      <PredecessorLink>\n`;
          xml += `        <PredecessorUID>${p.id}</PredecessorUID>\n`;
          xml += `        <Type>${linkType}</Type>\n`;
          xml += `        <CrossProject>0</CrossProject>\n`;
          if (p.lag) xml += `        <LinkLag>${p.lag * 480}</LinkLag>\n`; // em minutos
          xml += `      </PredecessorLink>\n`;
        });
      }

      xml += `    </Task>\n`;
    });

    xml += `  </Tasks>\n`;
    xml += `</Project>\n`;

    this.downloadFile(xml, `${this.slugify(project.name)}.xml`, 'application/xml');
    if (window.App) window.App.showToast(I18N.t('msgXmlExported'));
  },

  // 2. Importar do Microsoft Project XML
  importMsProjectXml(fileContent) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, 'text/xml');

      const nameEl = xmlDoc.querySelector('Project > Name');
      const startEl = xmlDoc.querySelector('Project > StartDate');
      const taskEls = xmlDoc.querySelectorAll('Tasks > Task');

      if (!taskEls.length) {
        alert('Nenhuma tarefa encontrada no arquivo XML do MS Project.');
        return;
      }

      const importedTasks = [];
      let minStart = '';

      taskEls.forEach(el => {
        const uidEl = el.querySelector('UID');
        const nameEl = el.querySelector('Name');
        const startVal = el.querySelector('Start')?.textContent || '';
        const finishVal = el.querySelector('Finish')?.textContent || '';
        const outlineEl = el.querySelector('OutlineLevel');
        const pctEl = el.querySelector('PercentComplete');
        const msEl = el.querySelector('Milestone');

        if (!uidEl || !nameEl) return;

        const uid = parseInt(uidEl.textContent, 10);
        const name = nameEl.textContent.trim();
        const start = startVal.substring(0, 10);
        const end = finishVal.substring(0, 10);
        const level = Math.max(0, (parseInt(outlineEl?.textContent, 10) || 1) - 1);
        const progress = parseInt(pctEl?.textContent, 10) || 0;
        const milestone = msEl?.textContent === '1';

        // Predecessoras
        const predLinks = el.querySelectorAll('PredecessorLink');
        const predsList = [];
        predLinks.forEach(pl => {
          const pUid = pl.querySelector('PredecessorUID')?.textContent;
          const pType = pl.querySelector('Type')?.textContent;
          if (pUid) {
            let tStr = 'FS';
            if (pType === '2') tStr = 'SS';
            else if (pType === '3') tStr = 'FF';
            else if (pType === '0') tStr = 'SF';
            predsList.push(`${pUid}${tStr}`);
          }
        });

        if (start && (!minStart || start < minStart)) minStart = start;

        importedTasks.push({
          id: uid,
          name,
          start: start || minStart || ProjectEngine.formatDate(new Date()),
          end: end || start,
          duration: ProjectEngine.countWorkDays(start, end),
          progress,
          level,
          milestone,
          predecessors: predsList.join(', '),
          resourceIds: []
        });
      });

      const newProjData = {
        project: {
          name: nameEl?.textContent || 'Projeto Importado (MS Project)',
          startDate: minStart || ProjectEngine.formatDate(new Date()),
          currency: 'BRL',
          baselineSaved: false,
          showCriticalPath: true
        },
        tasks: importedTasks,
        resources: State.resources || []
      };

      State.loadProject(newProjData, true);
      if (window.App) window.App.showToast(I18N.t('msgXmlImported'));
    } catch (e) {
      console.error('Erro ao importar XML:', e);
      alert('Falha ao processar arquivo XML do Microsoft Project. Verifique o formato.');
    }
  },

  // 3. Exportar JSON Completo
  exportJson() {
    const data = {
      project: State.project,
      tasks: State.tasks,
      resources: State.resources,
      exportedAt: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, `${this.slugify(State.project.name)}.projectclone`, 'application/json');
  },

  // 4. Importar JSON
  importJson(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      if (data && data.tasks) {
        State.loadProject(data, true);
        if (window.App) window.App.showToast('Projeto carregado com sucesso!');
      } else {
        alert('Arquivo de projeto inválido.');
      }
    } catch (e) {
      alert('Erro ao ler arquivo JSON.');
    }
  },

  // 5. Exportar CSV / Excel
  exportCsv() {
    const tasks = State.tasks || [];
    const resources = State.resources || [];
    const resMap = new Map();
    resources.forEach(r => resMap.set(r.id, r.name));

    // UTF-8 BOM para o Excel abrir sem quebrar acentos
    let csv = '\uFEFF';
    csv += 'ID;WBS;Nome da Tarefa;Duração (dias);Início;Término;Predecessoras;% Concluído;Recursos;Custo (R$)\r\n';

    tasks.forEach(t => {
      const resNames = (t.resourceIds || []).map(id => resMap.get(id)).filter(Boolean).join(', ');
      const row = [
        t.id,
        `"${t.wbs || ''}"`,
        `"${(t.name || '').replace(/"/g, '""')}"`,
        t.duration || 0,
        t.start || '',
        t.end || '',
        `"${t.predecessors || ''}"`,
        t.progress || 0,
        `"${resNames}"`,
        (t.cost || 0).toFixed(2).replace('.', ',')
      ];
      csv += row.join(';') + '\r\n';
    });

    this.downloadFile(csv, `${this.slugify(State.project.name)}.csv`, 'text/csv;charset=utf-8;');
  },

  // 6. Exportar Imagem PNG de Alta Resolução (300 DPI / 2x Retina)
  exportHighResPng() {
    const tasks = State.tasks || [];
    if (!tasks.length) {
      if (window.App) window.App.showToast('Nenhuma tarefa para exportar.');
      return;
    }

    const rowH = 34;
    const headerH = 100;
    const wbsW = 620;

    let minD = new Date();
    let maxD = new Date();
    maxD.setDate(maxD.getDate() + 30);

    let minStr = tasks[0]?.start;
    let maxStr = tasks[0]?.end;
    tasks.forEach(t => {
      if (t.start && (!minStr || t.start < minStr)) minStr = t.start;
      if (t.end && (!maxStr || t.end > maxStr)) maxStr = t.end;
    });
    if (minStr) minD = ProjectEngine.parseDate(minStr);
    if (maxStr) maxD = ProjectEngine.parseDate(maxStr);

    minD.setDate(minD.getDate() - 5);
    maxD.setDate(maxD.getDate() + 15);

    const totalDays = Math.max(30, Math.ceil((maxD - minD) / (1000 * 60 * 60 * 24)));
    const dayW = Math.max(16, Math.min(32, Math.floor(1400 / totalDays)));
    const timelineW = totalDays * dayW;

    const totalW = wbsW + timelineW + 40;
    const totalH = headerH + (tasks.length * rowH) + 60;

    const scale = 2; // Retina 2x
    const canvas = document.createElement('canvas');
    canvas.width = totalW * scale;
    canvas.height = totalH * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Fundo
    const isDark = !document.body.classList.contains('light-theme');
    const bgApp = isDark ? '#0f172a' : '#ffffff';
    const bgPanel = isDark ? '#1e293b' : '#f8fafc';
    const borderColor = isDark ? '#334155' : '#e2e8f0';
    const textMain = isDark ? '#f8fafc' : '#0f172a';
    const textMuted = isDark ? '#94a3b8' : '#64748b';

    ctx.fillStyle = bgApp;
    ctx.fillRect(0, 0, totalW, totalH);

    // Cabeçalho
    ctx.fillStyle = bgPanel;
    ctx.fillRect(0, 0, totalW, headerH);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, totalW, headerH);

    // Logo / Título
    ctx.fillStyle = '#107c41';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText('ProjectClone', 24, 38);

    ctx.fillStyle = textMain;
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText(`•  ${State.project.name || 'Cronograma do Projeto'}`, 160, 38);

    // Metadados
    const todayStr = ProjectEngine.formatDate(new Date());
    ctx.fillStyle = textMuted;
    ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.fillText(`Exportado em: ${todayStr} | Tarefas: ${tasks.length} | Moeda: ${State.project.currency || 'BRL'}`, 24, 68);

    // Legendas
    const legX = totalW - 440;
    ctx.fillStyle = '#107c41';
    ctx.fillRect(legX, 30, 14, 14);
    ctx.fillStyle = textMain;
    ctx.fillText('Normal', legX + 20, 42);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(legX + 80, 30, 14, 14);
    ctx.fillStyle = textMain;
    ctx.fillText('Crítico', legX + 100, 42);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(legX + 160, 30, 14, 14);
    ctx.fillStyle = textMain;
    ctx.fillText('Marco', legX + 180, 42);

    ctx.fillStyle = '#475569';
    ctx.fillRect(legX + 240, 30, 14, 14);
    ctx.fillStyle = textMain;
    ctx.fillText('Fase / Resumo', legX + 260, 42);

    // Cabeçalho da Tabela WBS
    const tableTop = headerH;
    ctx.fillStyle = isDark ? '#1a2234' : '#edf2f7';
    ctx.fillRect(0, tableTop, wbsW, 36);
    ctx.fillStyle = textMuted;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('ID', 16, tableTop + 22);
    ctx.fillText('WBS', 50, tableTop + 22);
    ctx.fillText('NOME DA TAREFA', 110, tableTop + 22);
    ctx.fillText('DUR.', 350, tableTop + 22);
    ctx.fillText('INÍCIO', 410, tableTop + 22);
    ctx.fillText('FIM', 490, tableTop + 22);
    ctx.fillText('%', 570, tableTop + 22);

    // Cabeçalho da Linha do Tempo (Gantt Header)
    ctx.fillRect(wbsW, tableTop, timelineW + 40, 36);
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(wbsW, tableTop, timelineW + 40, 36);

    // Linha divisória vertical WBS / Gantt
    ctx.beginPath();
    ctx.moveTo(wbsW, tableTop);
    ctx.lineTo(wbsW, totalH);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Desenha linhas de tarefas e barras
    tasks.forEach((t, i) => {
      const y = tableTop + 36 + (i * rowH);

      // Zebra
      if (i % 2 === 1) {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
        ctx.fillRect(0, y, totalW, rowH);
      }

      // Linha horizontal
      ctx.beginPath();
      ctx.moveTo(0, y + rowH);
      ctx.lineTo(totalW, y + rowH);
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
      ctx.stroke();

      // Texto da WBS
      const isSummary = !!t.isSummary;
      ctx.font = isSummary ? 'bold 12px sans-serif' : '12px sans-serif';
      ctx.fillStyle = textMain;

      ctx.fillText(String(t.id), 16, y + 22);
      ctx.fillText(t.wbs || '', 50, y + 22);

      const indent = (t.level || 0) * 14;
      const truncatedName = t.name.length > 28 ? t.name.slice(0, 26) + '...' : t.name;
      ctx.fillText(truncatedName, 110 + indent, y + 22);

      ctx.fillStyle = textMuted;
      ctx.fillText(`${t.duration || 0}d`, 350, y + 22);
      ctx.fillText(t.start || '', 410, y + 22);
      ctx.fillText(t.end || '', 490, y + 22);
      ctx.fillText(`${t.progress || 0}%`, 570, y + 22);

      // Barra de Gantt
      if (t.start && t.end) {
        const dStart = ProjectEngine.parseDate(t.start);
        const dEnd = ProjectEngine.parseDate(t.end);
        const startDiff = (dStart - minD) / (1000 * 60 * 60 * 24);
        const durDays = Math.max(1, (dEnd - dStart) / (1000 * 60 * 60 * 24) + 1);

        const barX = wbsW + 20 + (startDiff * dayW);
        const barW = Math.max(6, durDays * dayW);
        const barY = y + 7;
        const barH = 20;

        if (t.milestone) {
          // Diamante
          ctx.save();
          ctx.translate(barX, y + 17);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-7, -7, 14, 14);
          ctx.restore();
        } else if (isSummary) {
          // Barra de Sumário com brackets
          ctx.fillStyle = '#475569';
          ctx.fillRect(barX, barY + 3, barW, 6);
          ctx.fillRect(barX, barY + 3, 3, 12);
          ctx.fillRect(barX + barW - 3, barY + 3, 3, 12);
        } else {
          // Barra Normal ou Crítica
          const isCrit = t.isCritical && State.project.showCriticalPath;
          ctx.fillStyle = isCrit ? '#ef4444' : '#107c41';

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(barX, barY, barW, barH, 4);
          } else {
            ctx.rect(barX, barY, barW, barH);
          }
          ctx.fill();

          // Progresso interno
          if (t.progress > 0) {
            const progW = (barW * Math.min(100, t.progress)) / 100;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(barX, barY, progW, barH, [4, 0, 0, 4]);
            } else {
              ctx.rect(barX, barY, progW, barH);
            }
            ctx.fill();
          }
        }

        // Rótulo da tarefa ao lado da barra
        ctx.fillStyle = textMuted;
        ctx.font = '11px sans-serif';
        ctx.fillText(t.name, barX + barW + 8, y + 21);
      }
    });

    // Converte para Blob e dispara download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.slugify(State.project.name)}_gantt.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 150);

      if (window.App && window.App.showToast) {
        window.App.showToast('📸 Imagem PNG de alta resolução exportada com sucesso!');
      }
    }, 'image/png');
  },

  // Utilitários de Download
  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  },

  slugify(text) {
    return (text || 'projeto')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
};

window.ProjectIO = ProjectIO;
