/**
 * ProjectClone - Compartilhamento em Nuvem & Link Somente-Leitura (Cloud Share)
 * Salva snapshots de projetos em nuvem e gera links de visualização pública ou colaborativa.
 */

const CloudShare = {
  isReadOnly: false,
  currentShareId: null,

  init() {
    this.bindEvents();
    this.checkUrlForSharedProject();
  },

  // 1. VERIFICA SE A URL POSSUI PARÂMETRO ?share=ID
  async checkUrlForSharedProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const isRoParam = urlParams.get('ro') === '1' || urlParams.get('readonly') === '1';

    if (!shareId) return;

    this.currentShareId = shareId;
    this.showLoadingOverlay('Carregando projeto compartilhado...');

    try {
      const resp = await fetch(`api/share.php?action=get&id=${encodeURIComponent(shareId)}`);
      if (!resp.ok) {
        throw new Error('Projeto não encontrado ou link expirado.');
      }

      const res = await resp.json();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Falha ao interpretar dados do projeto.');
      }

      // Carrega no State
      State.loadProject(res.data, false);
      
      const shouldBeReadOnly = res.readOnly || isRoParam;
      if (shouldBeReadOnly) {
        this.enableReadOnlyMode(res.name || State.project.name);
      }

      this.hideLoadingOverlay();
      if (window.App && window.App.showToast) {
        window.App.showToast(`Projeto "${res.name}" carregado via link compartilhado!`);
      }
    } catch (err) {
      this.hideLoadingOverlay();
      console.error('[CloudShare] Erro:', err);
      alert('Não foi possível carregar o projeto compartilhado: ' + err.message);
    }
  },

  // 2. ATIVA MODO SOMENTE-LEITURA
  enableReadOnlyMode(projectName) {
    this.isReadOnly = true;
    document.body.classList.add('project-read-only-mode');

    // Cria banner informativo no topo da aplicação
    let banner = document.getElementById('readOnlyBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'readOnlyBanner';
      banner.className = 'read-only-banner';
      banner.innerHTML = `
        <div class="ro-banner-content">
          <span class="ro-icon">🔒</span>
          <span class="ro-text"><strong>Modo Somente Leitura:</strong> Você está visualizando o cronograma <em>"${this.escapeHtml(projectName)}"</em>. Nenhuma alteração afetará o original.</span>
        </div>
        <div class="ro-banner-actions">
          <button class="btn-ro-copy" id="btnCloneSharedToLocal" title="Criar uma cópia deste projeto para você editar e salvar livremente">
            💾 Salvar Cópia Editável
          </button>
        </div>
      `;
      document.body.prepend(banner);

      const btnClone = banner.querySelector('#btnCloneSharedToLocal');
      if (btnClone) {
        btnClone.addEventListener('click', () => this.cloneSharedToLocal());
      }
    }

    // Desativa edição inline na tabela WBS
    if (window.WBSGrid) {
      WBSGrid.isReadOnly = true;
    }

    // Desativa drag & drop no Gantt
    if (window.GanttChart) {
      GanttChart.isReadOnly = true;
    }
  },

  // Clona o projeto somente-leitura para o portfólio local do visitante
  cloneSharedToLocal() {
    const copyName = `Cópia de ${State.project.name || 'Projeto Compartilhado'}`;
    if (window.PortfolioManager) {
      const newProjId = PortfolioManager.createNewProject(copyName);
      State.loadProject({
        project: Object.assign({}, State.project, { name: copyName }),
        tasks: State.tasks,
        resources: State.resources
      }, false);
    }

    // Remove o modo somente leitura
    this.isReadOnly = false;
    document.body.classList.remove('project-read-only-mode');
    const banner = document.getElementById('readOnlyBanner');
    if (banner) banner.remove();

    if (window.WBSGrid) WBSGrid.isReadOnly = false;
    if (window.GanttChart) GanttChart.isReadOnly = false;

    // Remove parâmetros da URL sem recarregar a página
    const url = new URL(window.location);
    url.searchParams.delete('share');
    url.searchParams.delete('ro');
    url.searchParams.delete('readonly');
    window.history.replaceState({}, '', url.pathname);

    if (window.App && window.App.showToast) {
      window.App.showToast('Cópia salva com sucesso! Agora você pode editar todas as tarefas.');
    }
  },

  // 3. MODAL DE COMPARTILHAMENTO
  openModal() {
    const modal = document.getElementById('modalCloudShare');
    if (!modal) return;

    // Preenche dados do projeto atual
    const titleEl = modal.querySelector('#shareModalProjTitle');
    const metaEl = modal.querySelector('#shareModalProjMeta');
    const resultBox = modal.querySelector('#shareResultBox');

    if (titleEl) titleEl.textContent = State.project.name || 'Projeto Sem Título';
    if (metaEl) {
      metaEl.textContent = `${State.tasks.length} tarefas cadastradas • Início: ${ProjectEngine.formatDisplayDate(State.project.startDate)}`;
    }

    if (resultBox) {
      resultBox.style.display = 'none';
    }

    modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('modalCloudShare');
    if (modal) modal.classList.remove('open');
  },

  // Dispara o salvamento na nuvem e gera o link
  async generateShareLink() {
    const modal = document.getElementById('modalCloudShare');
    if (!modal) return;

    const optReadOnly = modal.querySelector('input[name="sharePermission"]:checked');
    const isReadOnly = optReadOnly ? optReadOnly.value === 'readonly' : true;

    const btnGenerate = modal.querySelector('#btnGenerateShareLink');
    if (btnGenerate) {
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = '<span>⏳</span> <span>Gerando link na nuvem...</span>';
    }

    try {
      const payload = {
        project: State.project,
        tasks: State.tasks,
        resources: State.resources,
        readOnly: isReadOnly
      };

      const resp = await fetch('api/share.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      if (!res.success || !res.shareUrl) {
        throw new Error(res.error || 'Falha ao salvar no servidor.');
      }

      this.displayShareResult(res.shareUrl, isReadOnly);
    } catch (err) {
      alert('Erro ao gerar compartilhamento: ' + err.message);
    } finally {
      if (btnGenerate) {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = '<span>⚡</span> <span>Gerar Novo Link de Compartilhamento</span>';
      }
    }
  },

  displayShareResult(url, isReadOnly) {
    const modal = document.getElementById('modalCloudShare');
    if (!modal) return;

    const resultBox = modal.querySelector('#shareResultBox');
    const inputUrl = modal.querySelector('#inputShareUrl');
    const btnCopy = modal.querySelector('#btnCopyShareUrl');
    const btnWhatsapp = modal.querySelector('#btnShareWhatsApp');
    const qrImg = modal.querySelector('#imgShareQrCode');

    if (inputUrl) inputUrl.value = url;

    // QR Code
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
    }

    // Botão de Copiar
    if (btnCopy) {
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(url).then(() => {
          btnCopy.innerHTML = '<span>✓</span> <span>Copiado!</span>';
          setTimeout(() => {
            btnCopy.innerHTML = '<span>📋</span> <span>Copiar Link</span>';
          }, 2000);
        });
      };
    }

    // Botão de WhatsApp
    if (btnWhatsapp) {
      const projName = State.project.name || 'Projeto';
      const modeText = isReadOnly ? 'somente leitura' : 'editável';
      const message = `Olá! Segue o link para visualizar o cronograma do projeto "${projName}" (${modeText}) no ProjectClone:\n\n${url}`;
      btnWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    }

    if (resultBox) {
      resultBox.style.display = 'block';
    }
  },

  bindEvents() {
    // Botão Fechar Modal
    document.addEventListener('click', (e) => {
      if (e.target.matches('#btnCloseShareModal, #btnCloseShareModalFooter')) {
        this.closeModal();
      }
      if (e.target.matches('#btnGenerateShareLink, #btnGenerateShareLink *')) {
        this.generateShareLink();
      }
    });
  },

  showLoadingOverlay(text) {
    let overlay = document.getElementById('cloudLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cloudLoadingOverlay';
      overlay.className = 'cloud-loading-overlay';
      overlay.innerHTML = `
        <div class="cloud-loading-box">
          <div class="cloud-spinner"></div>
          <span id="cloudLoadingText">${text}</span>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      document.getElementById('cloudLoadingText').textContent = text;
      overlay.style.display = 'flex';
    }
  },

  hideLoadingOverlay() {
    const overlay = document.getElementById('cloudLoadingOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.CloudShare = CloudShare;
