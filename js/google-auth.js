/**
 * ProjectClone - Autenticação Oficial Google OAuth 2.0 & Gestão de Créditos de IA
 * Padrão oficial do ecossistema 4U.IA.BR (Guia Mestre de Autenticação)
 */

const GoogleAuth = {
  CLIENT_ID: '569266864432-pd09jbb5no9ekdhdr018fj643nopp817.apps.googleusercontent.com',
  ADMIN_EMAILS: ['fbr4g4@gmail.com', 'fb4g4@gmail.com'],
  STORAGE_USER: 'projectclone_user_profile',
  STORAGE_CREDITS: 'projectclone_user_credits',
  DEFAULT_CREDITS: 10,
  ADMIN_CREDITS: 999999,

  tokenClient: null,
  currentUser: null,
  credits: 0,
  pendingAction: null,

  init() {
    this.loadStoredUser();
    this.initTokenClient();
    this.renderHeaderAuth();
  },

  // 1. CARREGA USUÁRIO ARMAZENADO LOCALMENTE
  loadStoredUser() {
    try {
      const stored = localStorage.getItem(this.STORAGE_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        const storedCredits = localStorage.getItem(this.STORAGE_CREDITS);
        
        if (this.isAdmin()) {
          this.credits = this.ADMIN_CREDITS;
        } else {
          this.credits = storedCredits !== null ? parseInt(storedCredits, 10) : this.DEFAULT_CREDITS;
        }
      }
    } catch (e) {
      console.warn('[GoogleAuth] Erro ao carregar usuário salvo:', e);
      this.currentUser = null;
      this.credits = 0;
    }
  },

  // 2. INICIALIZA CLIENTE DE TOKEN GOOGLE (GSI)
  initTokenClient() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      // Tenta novamente caso a biblioteca ainda esteja carregando
      setTimeout(() => this.initTokenClient(), 400);
      return;
    }

    try {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (response) => {
          if (response && response.access_token) {
            await this.handleTokenResponse(response.access_token);
          }
        },
        error_callback: (err) => {
          console.error('[GoogleAuth] Erro na autenticação Google:', err);
        }
      });
    } catch (e) {
      console.warn('[GoogleAuth] Erro ao iniciar initTokenClient:', e);
    }
  },

  // 3. FLUXO DE LOGIN COM GOOGLE
  signIn(onSuccess = null) {
    if (onSuccess) {
      this.pendingAction = onSuccess;
    }

    if (this.isLoggedIn()) {
      if (this.pendingAction) {
        const action = this.pendingAction;
        this.pendingAction = null;
        action();
      }
      return;
    }

    if (!this.tokenClient) {
      this.initTokenClient();
    }

    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'select_account' });
    } else {
      alert('Aguarde um instante enquanto o módulo do Google é inicializado...');
    }
  },

  async handleTokenResponse(accessToken) {
    try {
      // Busca informações cadastrais no Google UserInfo endpoint
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Falha ao obter perfil do usuário');

      const user = await res.json();
      this.processLoggedInUser(user);

      // Fecha modais de login se estiverem abertos
      this.closeAuthModal();

      if (window.App && window.App.showToast) {
        window.App.showToast(`👋 Olá, ${user.given_name || user.name}! Login com Google realizado.`);
      }

      // Executa ação pendente (ex: disparar a IA que o usuário havia clicado)
      if (this.pendingAction) {
        const action = this.pendingAction;
        this.pendingAction = null;
        action();
      }
    } catch (e) {
      console.error('[GoogleAuth] Erro ao processar login:', e);
      alert('Não foi possível concluir o login com o Google. Tente novamente.');
    }
  },

  processLoggedInUser(user) {
    this.currentUser = {
      id: user.sub,
      email: (user.email || '').toLowerCase().trim(),
      name: user.name || 'Usuário',
      givenName: user.given_name || user.name,
      picture: user.picture || '',
      locale: user.locale || 'pt-BR'
    };

    if (this.isAdmin()) {
      this.credits = this.ADMIN_CREDITS;
      localStorage.setItem('user_role', 'admin');
      console.log('👑 [GoogleAuth] Modo Administrador / VIP Ilimitado Ativado!');
    } else {
      const stored = localStorage.getItem(this.STORAGE_CREDITS);
      this.credits = stored !== null ? parseInt(stored, 10) : this.DEFAULT_CREDITS;
      localStorage.setItem('user_role', 'user');
    }

    localStorage.setItem(this.STORAGE_USER, JSON.stringify(this.currentUser));
    localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));

    this.renderHeaderAuth();
  },

  // 4. LOGOUT
  signOut() {
    this.currentUser = null;
    this.credits = 0;
    localStorage.removeItem(this.STORAGE_USER);
    localStorage.removeItem(this.STORAGE_CREDITS);
    localStorage.removeItem('user_role');

    this.renderHeaderAuth();
    this.closeUserDropdown();

    if (window.App && window.App.showToast) {
      window.App.showToast('Você saiu da sua conta.');
    }
  },

  // 5. CHECAGEM DE STATUS E REQUISITOS
  isLoggedIn() {
    return Boolean(this.currentUser && this.currentUser.email);
  },

  isAdmin() {
    if (!this.currentUser || !this.currentUser.email) return false;
    const email = this.currentUser.email.toLowerCase().trim();
    return this.ADMIN_EMAILS.includes(email);
  },

  hasCredits() {
    if (this.isAdmin()) return true;
    return this.credits > 0;
  },

  consumeCredit(cost = 1) {
    if (this.isAdmin()) return true;

    if (this.credits >= cost) {
      this.credits -= cost;
      localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
      this.renderHeaderAuth();
      return true;
    }
    return false;
  },

  // Guardião para recursos de IA
  requireAuthForAi(featureName, onAuthorized) {
    if (!this.isLoggedIn()) {
      this.openAuthModal(featureName, onAuthorized);
      return false;
    }

    if (!this.hasCredits()) {
      this.showCreditsDepletedModal();
      return false;
    }

    if (onAuthorized) {
      onAuthorized();
    }
    return true;
  },

  // 6. RENDERIZAÇÃO NA INTERFACE (HEADER)
  renderHeaderAuth() {
    let container = document.getElementById('headerUserAuth');
    if (!container) {
      const headerControls = document.querySelector('.app-header-controls');
      if (!headerControls) return;

      container = document.createElement('div');
      container.id = 'headerUserAuth';
      container.className = 'header-user-auth';
      // Insere antes do alternador de idioma
      const langGroup = headerControls.querySelector('.lang-btn-group');
      if (langGroup) {
        headerControls.insertBefore(container, langGroup);
      } else {
        headerControls.appendChild(container);
      }
    }

    if (!this.isLoggedIn()) {
      // Botão Entrar com Google
      container.innerHTML = `
        <button class="btn-header-google-login" id="btnHeaderGoogleLogin" title="Entrar com Conta Google para usar Inteligência Artificial">
          <svg class="google-svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="btn-g-text">Entrar</span>
        </button>
      `;

      const btn = container.querySelector('#btnHeaderGoogleLogin');
      if (btn) {
        btn.addEventListener('click', () => this.signIn());
      }
    } else {
      // Usuário Conectado: Avatar + Nome + Badge de Créditos
      const user = this.currentUser;
      const isAdmin = this.isAdmin();
      const badgeText = isAdmin ? '👑 VIP' : `✨ ${this.credits} IA`;
      const badgeClass = isAdmin ? 'badge-vip' : 'badge-credits';

      container.innerHTML = `
        <div class="user-profile-pill" id="btnUserProfilePill" title="Perfil Google: ${user.name} (${user.email})">
          <img class="user-avatar" src="${user.picture || 'icon.svg'}" alt="${user.name}" onerror="this.src='icon.svg'">
          <span class="user-name">${user.givenName || user.name.split(' ')[0]}</span>
          <span class="user-credit-tag ${badgeClass}">${badgeText}</span>
        </div>
      `;

      const pill = container.querySelector('#btnUserProfilePill');
      if (pill) {
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleUserDropdown();
        });
      }
    }
  },

  // 7. MENU SUSPENSO DO PERFIL DO USUÁRIO
  toggleUserDropdown() {
    let dropdown = document.getElementById('userProfileDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'userProfileDropdown';
      dropdown.className = 'user-profile-dropdown';
      document.body.appendChild(dropdown);

      // Fecha ao clicar fora
      document.addEventListener('click', (e) => {
        const pill = document.getElementById('btnUserProfilePill');
        if (dropdown && !dropdown.contains(e.target) && (!pill || !pill.contains(e.target))) {
          this.closeUserDropdown();
        }
      });
    }

    if (dropdown.classList.contains('open')) {
      this.closeUserDropdown();
      return;
    }

    const pill = document.getElementById('btnUserProfilePill');
    if (!pill) return;
    const rect = pill.getBoundingClientRect();

    dropdown.style.top = `${rect.bottom + 6}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;

    const user = this.currentUser || {};
    const isAdmin = this.isAdmin();

    dropdown.innerHTML = `
      <div class="u-drop-header">
        <img class="u-drop-avatar" src="${user.picture || 'icon.svg'}" alt="${user.name}">
        <div class="u-drop-info">
          <span class="u-drop-name">${user.name}</span>
          <span class="u-drop-email">${user.email}</span>
        </div>
      </div>

      <div class="u-drop-status">
        <div class="u-status-row">
          <span class="u-status-label">Créditos de IA:</span>
          <span class="u-status-val ${isAdmin ? 'text-vip' : ''}">
            ${isAdmin ? '👑 Ilimitado (VIP / Admin)' : `✨ ${this.credits} gerações disponíveis`}
          </span>
        </div>
        <div class="u-status-row">
          <span class="u-status-label">Status da Conta:</span>
          <span class="u-status-badge ${isAdmin ? 'badge-admin' : 'badge-user'}">
            ${isAdmin ? 'Administrador' : 'Usuário Ativo'}
          </span>
        </div>
      </div>

      <div class="u-drop-actions">
        <button class="btn-u-action" id="btnOpenPrivacyPolicy">
          <span>🛡️</span> <span>Termos & Privacidade</span>
        </button>
        <button class="btn-u-action danger" id="btnLogoutGoogle">
          <span>🚪</span> <span>Sair da Conta</span>
        </button>
      </div>
    `;

    dropdown.classList.add('open');

    // Eventos do menu
    const btnLogout = dropdown.querySelector('#btnLogoutGoogle');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.signOut());
    }

    const btnPrivacy = dropdown.querySelector('#btnOpenPrivacyPolicy');
    if (btnPrivacy) {
      btnPrivacy.addEventListener('click', () => {
        window.open('https://4u.ia.br/app/auth/privacidade.html', '_blank');
        this.closeUserDropdown();
      });
    }
  },

  closeUserDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    if (dropdown) dropdown.classList.remove('open');
  },

  // 8. MODAL DE AUTENTICAÇÃO OBRIGATÓRIA PARA RECURSOS DE IA
  openAuthModal(featureName = 'Inteligência Artificial', onAuthorized = null) {
    if (onAuthorized) this.pendingAction = onAuthorized;

    let modal = document.getElementById('modalGoogleAuthRequired');
    if (!modal) return;

    const featureEl = modal.querySelector('#authFeatureName');
    if (featureEl) {
      featureEl.textContent = featureName;
    }

    modal.classList.add('open');
  },

  closeAuthModal() {
    const modal = document.getElementById('modalGoogleAuthRequired');
    if (modal) modal.classList.remove('open');
  },

  showCreditsDepletedModal() {
    alert('Seus créditos gratuitos de IA foram utilizados.\n\nPara continuar utilizando sem limites, configure sua própria Chave de API da OpenAI em "Propriedades do Projeto" ou entre em contato com o suporte.');
  }
};

window.GoogleAuth = GoogleAuth;
