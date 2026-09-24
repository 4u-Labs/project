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
