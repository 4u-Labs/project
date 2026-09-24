/**
 * ProjectClone — Google OAuth 2.0 & Gestão de Créditos Compartilhados do Ecossistema 4U.IA.BR
 * Compatível com KeepAi, FreePDF, WordClone, ExcelClone e todo o ecossistema 4U
 */

const GoogleAuth = {
    CLIENT_ID: '569266864432-pd09jbb5no9ekdhdr018fj643nopp817.apps.googleusercontent.com',
    ADMIN_EMAILS: ['fbr4g4@gmail.com', 'fb4g4@gmail.com'],
    STORAGE_USER: 'user_profile',
    STORAGE_CREDITS: 'user_credits',
    STORAGE_TOKEN: 'user_token',
    STORAGE_ROLE: 'user_role',
    DEFAULT_CREDITS: 10,
    ADMIN_CREDITS: 999999,

    tokenClient: null,
    currentUser: null,
    token: null,
    credits: 0,
    _initialized: false,
    pendingAction: null,

    // Controle de Recarga
    rechargeMethod: 'pix',
    selectedPackage: 1, // Padrão: 50 créditos (Mais Popular)
    pixPollingInterval: null,
    paypalPromise: null,
    _toastTimeout: null,

    PACKAGES: [
        { credits: 10, brl: 'R$ 4,90', usd: '$0.99', unitBrl: 'R$ 0,49/un', unitUsd: '$0.10/ea', badgePt: '', badgeEn: '' },
        { credits: 50, brl: 'R$ 19,90', usd: '$3.99', unitBrl: 'R$ 0,39/un', unitUsd: '$0.08/ea', badgePt: 'MAIS POPULAR', badgeEn: 'MOST POPULAR' },
        { credits: 100, brl: 'R$ 34,90', usd: '$6.99', unitBrl: 'R$ 0,34/un', unitUsd: '$0.07/ea', badgePt: 'MELHOR VALOR', badgeEn: 'BEST VALUE' }
    ],

    init() {
        this.loadStoredSession();
        this.initTokenClient();
        this.renderAuthUI();
        this.syncWithBackend();

        if (this._initialized) return;
        this._initialized = true;

        // Injeta estilos utilitários caso ainda não existam
        if (!document.getElementById('google-auth-dynamic-styles')) {
            const style = document.createElement('style');
            style.id = 'google-auth-dynamic-styles';
            style.textContent = `
                @keyframes gaspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .ga-spin { display: inline-block; animation: gaspin 1.2s linear infinite; }
            `;
            document.head.appendChild(style);
        }

        // Fechar dropdown de usuário ao clicar fora
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdownMenu');
            const avatarBtn = document.getElementById('userAvatarBtn');
            if (dropdown && !dropdown.classList.contains('hidden')) {
                if (avatarBtn && !avatarBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    },

    getLang() {
        if (typeof I18N !== 'undefined' && I18N.currentLang) {
            return I18N.currentLang;
        }
        return (typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('office_lang') || 'pt'));
    },

    // 1. CARREGAR SESSÃO SALVA (Detecta login de qualquer app 4U no mesmo domínio)
    loadStoredSession() {
        try {
            const stored = localStorage.getItem(this.STORAGE_USER);
            const token = localStorage.getItem(this.STORAGE_TOKEN);
            if (stored) {
                this.currentUser = JSON.parse(stored);
                this.token = token || (this.currentUser && this.currentUser.token) || null;
                if (this.currentUser && this.token) {
                    this.currentUser.token = this.token;
                }
                const storedCredits = localStorage.getItem(this.STORAGE_CREDITS);

                if (this.isAdmin()) {
                    this.credits = this.ADMIN_CREDITS;
                } else {
                    this.credits = storedCredits !== null ? parseInt(storedCredits, 10) : this.DEFAULT_CREDITS;
                }
            }
        } catch (e) {
            console.warn('[GoogleAuth] Erro ao carregar sessão local:', e);
            this.currentUser = null;
            this.token = null;
            this.credits = 0;
        }
    },

    // 2. INICIALIZAR CLIENTE DO GOOGLE (GSI)
    initTokenClient() {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
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
                    console.error('[GoogleAuth] Erro no GSI:', err);
                }
            });
        } catch (e) {
            console.warn('[GoogleAuth] Erro ao inicializar initTokenClient:', e);
        }
    },

    // 3. FLUXO DE LOGIN
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

        if (this.tokenClient) {
            this.tokenClient.requestAccessToken({ prompt: 'select_account' });
        } else {
            console.warn('[GoogleAuth] Cliente GSI ainda não carregado. Tentando novamente...');
            setTimeout(() => {
                if (this.tokenClient) {
                    this.tokenClient.requestAccessToken({ prompt: 'select_account' });
                } else {
                    alert(this.getLang() === 'en' ? 'Google services are loading, please try again in a few seconds.' : 'Os serviços do Google estão carregando. Tente novamente em instantes.');
                }
            }, 800);
        }
    },

    async handleTokenResponse(accessToken) {
        try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!userInfoRes.ok) {
                throw new Error('Falha ao obter perfil do Google.');
            }

            const googleUser = await userInfoRes.json();

            const backendRes = await fetch('api/auth.php?action=google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: googleUser.email,
                    name: googleUser.name || googleUser.given_name || 'Usuário 4U',
                    picture: googleUser.picture || ''
                })
            });

            const data = await backendRes.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro na autenticação central.');
            }

            this.token = data.token;
            this.currentUser = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.display_name || googleUser.name,
                givenName: googleUser.given_name || (data.user.display_name ? data.user.display_name.split(' ')[0] : 'Usuário'),
                picture: data.user.photo_url || googleUser.picture || '',
                isVip: data.user.is_vip,
                token: data.token
            };

            this.credits = data.user.credits;

            // Salva chaves unificadas compartilhadas do ecossistema 4U
            localStorage.setItem(this.STORAGE_USER, JSON.stringify(this.currentUser));
            localStorage.setItem(this.STORAGE_TOKEN, this.token);
            localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
            localStorage.setItem(this.STORAGE_ROLE, this.isAdmin() ? 'admin' : 'user');

            this.renderAuthUI();
            this.closeAuthModal();

            this.showToast(this.getLang() === 'en' ? `Welcome, ${this.currentUser.name}!` : `Bem-vindo(a), ${this.currentUser.name}!`, 'success');

            if (this.pendingAction) {
                const action = this.pendingAction;
                this.pendingAction = null;
                action();
            }
        } catch (e) {
            console.error('[GoogleAuth] Erro ao processar login:', e);
            alert('Erro no login Google: ' + e.message);
        }
    },

    // 4. SINCRONIZAR SALDO COM O BACKEND
    async syncWithBackend() {
        if (!this.token) return;
        try {
            const res = await fetch('api/auth.php?action=sync', {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.user) {
                    this.credits = data.user.credits;
                    localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
                    this.updateCreditsBadge();
                }
            } else if (res.status === 401) {
                console.warn('[GoogleAuth] Token expirado ou inválido no servidor. Limpando credenciais locais...');
                this.signOut(false);
            }
        } catch (e) {
            console.warn('[GoogleAuth] Falha na sincronização em segundo plano:', e);
        }
    },

    // 5. LOGOUT
    async signOut(callBackend = true) {
        try {
            if (callBackend && this.token) {
                fetch('api/auth.php?action=logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${this.token}` }
                }).catch(() => {});
            }
        } catch (e) {}

        this.currentUser = null;
        this.token = null;
        this.credits = 0;

        localStorage.removeItem(this.STORAGE_USER);
        localStorage.removeItem(this.STORAGE_TOKEN);
        localStorage.removeItem(this.STORAGE_CREDITS);
        localStorage.removeItem(this.STORAGE_ROLE);

        this.renderAuthUI();
        this.closeUserDropdown();

        this.showToast(this.getLang() === 'en' ? 'Logged out successfully.' : 'Desconectado com sucesso.', 'info');
    },

    // 6. CHECAGEM DE STATUS & CRÉDITOS
    isLoggedIn() {
        return Boolean(this.currentUser && this.currentUser.email);
    },

    isAdmin() {
        if (!this.currentUser || !this.currentUser.email) return false;
        return this.ADMIN_EMAILS.includes(this.currentUser.email.toLowerCase().trim());
    },

    hasCredits(cost = 1) {
        if (this.isAdmin()) return true;
        return this.credits >= cost;
    },

    async consumeCredit(cost = 1, tool = 'ProjectClone') {
        if (this.isAdmin()) {
            this.updateCreditsBadge();
            return true;
        }

        try {
            const res = await fetch('api/credits.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                },
                body: JSON.stringify({ cost, tool })
            });

            const data = await res.json();
            if (data.success) {
                this.credits = data.credits_remaining;
                localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
                this.updateCreditsBadge();
                return true;
            } else {
                this.openCreditsModal('insufficient');
                return false;
            }
        } catch (e) {
            this.credits = Math.max(0, this.credits - cost);
            localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
            this.updateCreditsBadge();
            return true;
        }
    },

    // 7. RENDERIZADOR SEGURO DE AVATAR (NUNCA exibe ícone 4U distorcido)
    getAvatarHtml(name, picture, size = 22) {
        const initial = (name || 'U').trim().charAt(0).toUpperCase();
        const initialBadge = `<div class="user-avatar-initial" style="width:${size}px; height:${size}px; line-height:${size}px; border-radius:50%; background:linear-gradient(135deg, #107c41, #059669); color:#fff; font-weight:800; font-size:${Math.round(size * 0.48)}px; text-align:center; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">${initial}</div>`;

        if (!picture || typeof picture !== 'string' || picture.toLowerCase().includes('4u') || picture.toLowerCase().includes('gravatar.com')) {
            return initialBadge;
        }

        return `<img src="${picture}" alt="${name}" class="user-avatar-img" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; display:inline-block; flex-shrink:0;" onerror="this.outerHTML='<div class=\\'user-avatar-initial\\' style=\\'width:${size}px; height:${size}px; line-height:${size}px; border-radius:50%; background:linear-gradient(135deg, #107c41, #059669); color:#fff; font-weight:800; font-size:${Math.round(size * 0.48)}px; text-align:center; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;\\'>${initial}</div>'">`;
    },

    // 8. RENDERIZAÇÃO DA INTERFACE (HEADER)
    renderAuthUI() {
        const container = document.getElementById('googleAuthContainer');
        if (!container) return;

        const isEn = this.getLang() === 'en';

        if (!this.isLoggedIn()) {
            container.innerHTML = `
                <button type="button" onclick="GoogleAuth.signIn()" class="btn-google-login" style="display:inline-flex; align-items:center; gap:7px; padding:5px 14px; height:30px; box-sizing:border-box; background:#ffffff; color:#1f2937; font-size:0.82rem; font-weight:700; border-radius:20px; border:1px solid rgba(255,255,255,0.6); box-shadow:0 1px 4px rgba(0,0,0,0.18); cursor:pointer; white-space:nowrap; text-decoration:none; font-family:inherit; line-height:1.2;" title="${isEn ? 'Sign in with Google to sync 4U AI credits' : 'Entrar com Conta Google e sincronizar créditos de IA'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" class="google-svg" style="width:16px; height:16px; flex-shrink:0; display:block;">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>${isEn ? 'Sign in with Google' : 'Entrar com Google'}</span>
                </button>
            `;
        } else {
            const avatar = this.currentUser.picture || '';
            const name = this.currentUser.givenName || this.currentUser.name || 'Conta 4U';
            const isAdmin = this.isAdmin();
            const creditsText = isAdmin ? '∞ VIP' : `${this.credits}`;

            container.innerHTML = `
                <div class="google-auth-user-wrap" style="position:relative; display:flex; align-items:center; gap:6px;">
                    <!-- Badge Unificado de Créditos IA -->
                    <button type="button" onclick="GoogleAuth.openCreditsModal('balance')" class="btn-credits-badge" style="display:inline-flex; align-items:center; gap:5px; padding:4px 12px; height:30px; box-sizing:border-box; background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.5); color:#fef08a; font-size:0.8rem; font-weight:800; border-radius:20px; cursor:pointer; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.15); font-family:inherit; line-height:1.2;" title="${isEn ? 'Your credits balance (Click to manage)' : 'Seus créditos de IA (Clique para ver saldo)'}">
                        <span class="credits-gem" style="font-size:0.85rem; line-height:1;">💎</span>
                        <span id="creditsCountDisplay" class="credits-num">${creditsText}</span>
                        ${!isAdmin ? `<span class="credits-lbl" style="font-size:0.68rem; text-transform:uppercase; font-weight:700; opacity:0.9;">${isEn ? 'cr' : 'créd'}</span>` : ''}
                        ${!isAdmin ? `<span style="display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px; border-radius:50%; background:rgba(245,158,11,0.4); color:#fff; font-size:10px; font-weight:900; line-height:1; margin-left:2px;" title="${isEn ? 'Buy AI Credits' : 'Adquirir créditos'}">+</span>` : ''}
                    </button>

                    <!-- Botão Perfil Usuário -->
                    <button type="button" id="userAvatarBtn" onclick="GoogleAuth.toggleUserDropdown()" class="btn-user-avatar" style="display:inline-flex; align-items:center; gap:6px; padding:3px 10px 3px 4px; height:30px; box-sizing:border-box; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:20px; color:#ffffff; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:inherit; line-height:1.2; white-space:nowrap;" title="${name}">
                        ${this.getAvatarHtml(name, avatar, 22)}
                        <span class="user-display-name" style="max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
                        <i class="fa-solid fa-chevron-down user-chevron" style="font-size:8px; opacity:0.7;"></i>
                    </button>

                    <!-- Dropdown de Usuário -->
                    <div id="userDropdownMenu" class="user-dropdown-menu hidden">
                        <div class="user-dropdown-header">
                            ${this.getAvatarHtml(name, avatar, 36)}
                            <div class="user-dropdown-meta">
                                <div class="user-name-title">${this.currentUser.name || name}</div>
                                <div class="user-email-subtitle">${this.currentUser.email}</div>
                                <span class="user-role-badge ${isAdmin ? 'vip' : ''}">
                                    ${isAdmin ? '⭐ Admin VIP' : 'Conta 4U'}
                                </span>
                            </div>
                        </div>

                        <div class="user-dropdown-body">
                            <div class="user-balance-row">
                                <span class="balance-lbl">${isEn ? 'AI Credits:' : 'Saldo de Créditos:'}</span>
                                <span class="balance-val">💎 ${isAdmin ? '∞ VIP' : `${this.credits} ${isEn ? 'credits' : 'créditos'}`}</span>
                            </div>
                            ${!isAdmin ? `
                            <button type="button" onclick="GoogleAuth.openCreditsModal('buy'); GoogleAuth.closeUserDropdown();" class="user-menu-item highlight">
                                <span>⚡ ${isEn ? 'Buy / Recharge Credits' : 'Comprar / Recarregar Créditos'}</span>
                            </button>` : ''}
                            <a href="../index.php" class="user-menu-item">
                                <i class="fa-solid fa-th-large"></i>
                                <span>${isEn ? 'OfficeClone Suite' : 'Suíte OfficeClone'}</span>
                            </a>
                        </div>

                        <div class="user-dropdown-footer">
                            <button type="button" onclick="GoogleAuth.signOut()" class="btn-logout">
                                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                <span>${isEn ? 'Sign Out' : 'Sair da Conta'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    updateCreditsBadge() {
        const display = document.getElementById('creditsCountDisplay');
        if (display) {
            display.textContent = this.isAdmin() ? '∞ VIP' : `${this.credits}`;
        }
    },

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdownMenu');
        if (dropdown) dropdown.classList.toggle('hidden');
    },

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdownMenu');
        if (dropdown) dropdown.classList.add('hidden');
    },

    showCreditsDepletedModal() {
        this.openCreditsModal('insufficient');
    },

    requireAuthForAi(featureName = 'ProjectClone IA', callback = null) {
        if (!this.isLoggedIn()) {
            this.openAuthModal(featureName, callback);
            return false;
        }
        if (!this.hasCredits(1)) {
            this.openCreditsModal('insufficient');
            return false;
        }
        if (callback) {
            callback();
        }
        return true;
    },

    // 9. MODAL DE AVISO: LOGIN GOOGLE OBRIGATÓRIO
    openAuthModal(featureName = 'ProjectClone IA', onSuccess = null) {
        if (onSuccess) {
            this.pendingAction = onSuccess;
        }
        let modal = document.getElementById('googleAuthPromptModal');
        const isEn = this.getLang() === 'en';

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'googleAuthPromptModal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background:#ffffff; border-radius:16px; padding:24px; max-width:420px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); position:relative; color:#1f2937; text-align:left; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <button type="button" onclick="GoogleAuth.closeAuthModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.1rem; color: #9ca3af; cursor: pointer; font-weight: bold;">✕</button>
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 124, 65, 0.12); color: #107c41; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 12px;">
                    🪄
                </div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: #111827; margin: 0 0 6px 0;">
                    ${isEn ? 'Sign in with Google' : 'Faça login com sua conta Google'}
                </h3>
                <p style="font-size: 0.82rem; color: #4b5563; line-height: 1.45; margin: 0 0 16px 0;">
                    ${isEn 
                        ? `Connect your Google account to use <strong>${featureName}</strong> and sync your unified 4U credits. New accounts get <strong>10 free credits</strong> to use in any 4U app!` 
                        : `Conecte sua conta Google para utilizar o recurso <strong>${featureName}</strong> e sincronizar seus créditos unificados. Novos usuários ganham <strong>10 créditos gratuitos</strong> para usar em qualquer app da 4U!`}
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button type="button" onclick="GoogleAuth.signIn()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 16px; background: #107c41; color: #ffffff; border-radius: 8px; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer; box-shadow: 0 2px 6px rgba(16, 124, 65, 0.3);">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>${isEn ? 'Sign in with Google' : 'Entrar com Conta Google'}</span>
                    </button>
                    <button type="button" onclick="GoogleAuth.closeAuthModal()" style="width: 100%; padding: 8px; text-align: center; font-size: 0.8rem; color: #6b7280; background: none; border: none; cursor: pointer;">
                        ${isEn ? 'Cancel' : 'Cancelar'}
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    },

    closeAuthModal() {
        const modal = document.getElementById('googleAuthPromptModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },

    // 10. MODAL COMPLETO DE RECARGA DE CRÉDITOS (PIX + PAYPAL 100% BILÍNGUE)
    openCreditsModal(type = 'balance') {
        this.stopPixPolling();

        const isEn = this.getLang() === 'en';
        this.rechargeMethod = (isEn ? 'paypal' : 'pix');
        this.selectedPackage = 1; // Padrão: 50 créditos

        let modal = document.getElementById('creditsInfoModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'creditsInfoModal';
            document.body.appendChild(modal);
        }

        modal.onclick = (e) => {
            if (e.target === modal) this.closeCreditsModal();
        };

        const isInsuf = (type === 'insufficient');
        const creditsText = this.isAdmin() ? '∞ VIP' : `${this.credits}`;

        modal.innerHTML = `
            <div style="background:#ffffff; border-radius:16px; padding:22px 24px; max-width:450px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); position:relative; color:#1f2937; max-height:92vh; overflow-y:auto; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align:left;">
                <button type="button" onclick="GoogleAuth.closeCreditsModal()" style="position:absolute; top:14px; right:14px; background:none; border:none; font-size:1.15rem; color:#9ca3af; cursor:pointer; font-weight:bold; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:all 0.2s;" onmouseover="this.style.background='#f3f4f6'; this.style.color='#111827'" onmouseout="this.style.background='none'; this.style.color='#9ca3af'">✕</button>
                
                <!-- Cabeçalho -->
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                    <div style="width:44px; height:44px; border-radius:12px; background:${isInsuf ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.15)'}; color:${isInsuf ? '#dc2626' : '#d97706'}; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
                        ${isInsuf ? '⚠️' : '💎'}
                    </div>
                    <div style="overflow:hidden;">
                        <h3 style="font-size:1.1rem; font-weight:800; color:#111827; margin:0; line-height:1.2;">
                            ${isInsuf ? (isEn ? 'Insufficient AI Credits' : 'Créditos de IA Insuficientes') : (isEn ? 'Recharge AI Credits' : 'Recarregar Créditos de IA')}
                        </h3>
                        <span style="display:inline-block; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.04em; color:#0284c7; font-weight:800; background:rgba(2, 132, 199, 0.1); padding:2px 7px; border-radius:4px; margin-top:3px;">
                            ${isEn ? 'Unified 4U Ecosystem' : 'Ecossistema Unificado 4U'}
                        </span>
                    </div>
                </div>

                <p style="font-size:0.78rem; color:#6b7280; line-height:1.45; margin:0 0 12px 0;">
                    ${isEn 
                        ? 'Your AI credits are shared across <strong>ProjectClone, WordClone, ExcelClone, FreePDF, KeepAi</strong> and all 4U tools.' 
                        : 'Seus créditos são integrados e válidos no <strong>ProjectClone, WordClone, ExcelClone, FreePDF, KeepAi</strong> e todo o ecossistema 4U.'}
                </p>

                <!-- Saldo Atual -->
                <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.8rem; color:#4b5563; font-weight:600;">${isEn ? 'Current Balance:' : 'Seu Saldo Atual:'}</span>
                    <span style="font-size:0.95rem; font-weight:800; color:#d97706;">💎 ${creditsText} ${isEn ? 'credits' : 'créditos'}</span>
                </div>

                <!-- Abas de Pagamento (PIX vs PayPal) -->
                <div style="display:flex; gap:6px; background:#f3f4f6; padding:4px; border-radius:10px; border:1px solid #e5e7eb; margin-bottom:14px;">
                    <button type="button" id="tab-recharge-pix" onclick="GoogleAuth.setRechargeMethod('pix')" style="flex:1; padding:8px 10px; border-radius:7px; border:none; font-weight:700; font-size:0.8rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:5px; background:${this.rechargeMethod === 'pix' ? '#107c41' : 'transparent'}; color:${this.rechargeMethod === 'pix' ? '#ffffff' : '#4b5563'}; box-shadow:${this.rechargeMethod === 'pix' ? '0 2px 6px rgba(16,124,65,0.3)' : 'none'};">
                        <span>🇧🇷</span>
                        <span>PIX (R$ BRL)</span>
                    </button>
                    <button type="button" id="tab-recharge-paypal" onclick="GoogleAuth.setRechargeMethod('paypal')" style="flex:1; padding:8px 10px; border-radius:7px; border:none; font-weight:700; font-size:0.8rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:5px; background:${this.rechargeMethod === 'paypal' ? '#107c41' : 'transparent'}; color:${this.rechargeMethod === 'paypal' ? '#ffffff' : '#4b5563'}; box-shadow:${this.rechargeMethod === 'paypal' ? '0 2px 6px rgba(16,124,65,0.3)' : 'none'};">
                        <span>🌐</span>
                        <span>PayPal / Card (US$)</span>
                    </button>
                </div>

                <!-- Grid de Pacotes de Créditos -->
                <div id="rechargePackagesGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:14px;">
                    ${this.renderPackageCardsHtml()}
                </div>

                <!-- Seção PIX -->
                <div id="pix-payment-section" style="display:${this.rechargeMethod === 'pix' ? 'block' : 'none'};">
                    <div id="qr-area" style="min-height:0;"></div>
                    <div style="margin-top:10px;">
                        <button type="button" id="btn-gerar-pix" onclick="GoogleAuth.generatePix()" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; background:linear-gradient(135deg, #107c41, #059669); color:#ffffff; border-radius:10px; font-size:0.88rem; font-weight:800; border:none; cursor:pointer; box-shadow:0 3px 8px rgba(16,124,65,0.3); transition:all 0.2s;">
                            <span>⚡</span>
                            <span id="btnGerarPixText">${isEn ? `Generate PIX QR Code (${this.PACKAGES[this.selectedPackage].brl})` : `Gerar QR Code PIX (${this.PACKAGES[this.selectedPackage].brl})`}</span>
                        </button>
                    </div>
                </div>

                <!-- Seção PayPal -->
                <div id="paypal-payment-section" style="display:${this.rechargeMethod === 'paypal' ? 'block' : 'none'}; margin-top:8px;">
                    <div id="paypal-button-container" style="min-height:48px;"></div>
                </div>

                <!-- Aviso de Gratuidade -->
                <div style="margin-top:12px; font-size:0.72rem; color:#4b5563; text-align:center; line-height:1.4; background:#eff6ff; padding:8px 12px; border-radius:8px; border:1px solid #bfdbfe;">
                    💎 <strong>${isEn ? '100% Free:' : '100% Gratuito:'}</strong> ${isEn ? 'Managing project schedules, charts and saving are 100% free and unlimited. Credits are only needed for AI generation.' : 'A gestão do cronograma, tabelas e salvamento de projetos são totalmente gratuitos. Os créditos são necessários apenas para a Inteligência Artificial.'}
                </div>

                <!-- Doação Voluntária PayPal -->
                <div style="margin-top:14px; text-align:center; font-size:0.76rem; border-top:1px solid #e5e7eb; padding-top:12px; line-height:1.4;">
                    <span style="color:#6b7280;">${isEn ? 'Want to support the developer with an open contribution?' : 'Deseja apenas apoiar o desenvolvedor com uma contribuição voluntária?'}</span><br>
                    <a href="https://www.paypal.com/ncp/payment/L7YRCS984T33N" target="_blank" rel="noopener noreferrer" style="color:#d97706; font-weight:700; text-decoration:underline; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">
                        ☕ ${isEn ? 'Make a Free Donation via PayPal' : 'Fazer Doação Livre via PayPal'}
                    </a>
                </div>

                <div style="margin-top:10px;">
                    <button type="button" onclick="GoogleAuth.closeCreditsModal()" style="width:100%; padding:7px; text-align:center; font-size:0.78rem; color:#6b7280; background:none; border:none; cursor:pointer; border-radius:6px; transition:background 0.2s;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">
                        ${isEn ? 'Close' : 'Fechar'}
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        if (this.rechargeMethod === 'paypal') {
            this.renderPayPalButtons();
        }
    },

    closeCreditsModal() {
        this.stopPixPolling();
        const modal = document.getElementById('creditsInfoModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },

    setRechargeMethod(method) {
        this.rechargeMethod = method;
        const isPix = method === 'pix';

        if (!isPix) {
            this.stopPixPolling();
        }

        const tabPix = document.getElementById('tab-recharge-pix');
        const tabPaypal = document.getElementById('tab-recharge-paypal');
        if (tabPix) {
            tabPix.style.background = isPix ? '#107c41' : 'transparent';
            tabPix.style.color = isPix ? '#ffffff' : '#4b5563';
            tabPix.style.boxShadow = isPix ? '0 2px 6px rgba(16,124,65,0.3)' : 'none';
        }
        if (tabPaypal) {
            tabPaypal.style.background = !isPix ? '#107c41' : 'transparent';
            tabPaypal.style.color = !isPix ? '#ffffff' : '#4b5563';
            tabPaypal.style.boxShadow = !isPix ? '0 2px 6px rgba(16,124,65,0.3)' : 'none';
        }

        const pixSec = document.getElementById('pix-payment-section');
        const paypalSec = document.getElementById('paypal-payment-section');
        if (pixSec) pixSec.style.display = isPix ? 'block' : 'none';
        if (paypalSec) paypalSec.style.display = !isPix ? 'block' : 'none';

        // Atualiza os preços nos cards
        this.PACKAGES.forEach((pkg, idx) => {
            const priceEl = document.getElementById(`pkgPriceDisplay-${idx}`);
            const unitEl = document.getElementById(`pkgUnitDisplay-${idx}`);
            if (priceEl) priceEl.textContent = isPix ? pkg.brl : pkg.usd;
            if (unitEl) unitEl.textContent = isPix ? `(${pkg.unitBrl})` : `(${pkg.unitUsd})`;
        });

        this.updateGeneratePixButtonText();

        if (!isPix) {
            this.renderPayPalButtons();
        }
    },

    selectRechargePackage(index) {
        this.selectedPackage = index;

        this.PACKAGES.forEach((_, idx) => {
            const card = document.getElementById(`pkgCard-${idx}`);
            if (card) {
                const isSel = (idx === index);
                card.style.border = isSel ? '2px solid #f59e0b' : '1px solid #e5e7eb';
                card.style.background = isSel ? '#fffbeb' : '#ffffff';
                card.style.boxShadow = isSel ? '0 2px 8px rgba(245,158,11,0.2)' : 'none';
            }
        });

        this.updateGeneratePixButtonText();

        const qrArea = document.getElementById('qr-area');
        if (qrArea) qrArea.innerHTML = '';
        this.stopPixPolling();

        if (this.rechargeMethod === 'paypal') {
            this.renderPayPalButtons();
        }
    },

    updateGeneratePixButtonText() {
        const btnText = document.getElementById('btnGerarPixText');
        if (btnText && this.PACKAGES[this.selectedPackage]) {
            const isEn = this.getLang() === 'en';
            const price = this.PACKAGES[this.selectedPackage].brl;
            btnText.textContent = isEn ? `Generate PIX QR Code (${price})` : `Gerar QR Code PIX (${price})`;
        }
    },

    renderPackageCardsHtml() {
        const isEn = this.getLang() === 'en';
        const isPix = this.rechargeMethod === 'pix';

        return this.PACKAGES.map((pkg, idx) => {
            const isSel = (idx === this.selectedPackage);
            const badge = isEn ? pkg.badgeEn : pkg.badgePt;
            const badgeColor = idx === 1 ? 'background:#f59e0b; color:#000;' : 'background:#107c41; color:#fff;';
            const price = isPix ? pkg.brl : pkg.usd;
            const unit = isPix ? `(${pkg.unitBrl})` : `(${pkg.unitUsd})`;

            return `
                <div id="pkgCard-${idx}" onclick="GoogleAuth.selectRechargePackage(${idx})" style="position:relative; padding:12px 6px; text-align:center; border-radius:10px; cursor:pointer; transition:all 0.2s; border:${isSel ? '2px solid #f59e0b' : '1px solid #e5e7eb'}; background:${isSel ? '#fffbeb' : '#ffffff'}; box-shadow:${isSel ? '0 2px 8px rgba(245,158,11,0.2)' : 'none'};">
                    ${badge ? `
                        <span style="position:absolute; top:-9px; left:50%; transform:translateX(-50%); font-size:0.58rem; font-weight:900; ${badgeColor} padding:1px 6px; border-radius:6px; white-space:nowrap; letter-spacing:0.04em; text-transform:uppercase;">
                            ${badge}
                        </span>
                    ` : ''}
                    <div style="font-size:1.15rem; font-weight:800; color:#d97706; line-height:1.2;">
                        💎 ${pkg.credits}
                    </div>
                    <div style="font-size:0.68rem; color:#6b7280; font-weight:600; text-transform:uppercase; margin-top:2px;">
                        ${isEn ? 'credits' : 'créditos'}
                    </div>
                    <div id="pkgPriceDisplay-${idx}" style="font-size:0.85rem; font-weight:800; color:#111827; margin-top:4px;">
                        ${price}
                    </div>
                    <div id="pkgUnitDisplay-${idx}" style="font-size:0.62rem; color:#6b7280; margin-top:1px;">
                        ${unit}
                    </div>
                </div>
            `;
        }).join('');
    },

    // 11. GERAÇÃO E GERENCIAMENTO DE PIX
    async generatePix() {
        if (!this.isLoggedIn()) {
            this.openAuthModal(this.getLang() === 'en' ? 'AI Credits Recharge' : 'Recarga de Créditos de IA', () => {
                this.openCreditsModal('buy');
            });
            return;
        }

        const isEn = this.getLang() === 'en';
        const btn = document.getElementById('btn-gerar-pix');
        const qrArea = document.getElementById('qr-area');
        if (!qrArea) return;

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="ga-spin">⏳</span> ${isEn ? 'Generating PIX...' : 'Gerando PIX...'}`;
        }

        try {
            const res = await fetch('api/mp_create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ package_index: this.selectedPackage })
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || (isEn ? 'Failed to generate PIX.' : 'Erro ao gerar PIX.'));
            }

            this.renderPixQR(data);
            this.startPixPolling(data.payment_id);
            this.showToast(isEn ? 'PIX QR Code ready! Scan to pay.' : 'QR Code PIX gerado! Escaneie para pagar.', 'info');
        } catch (e) {
            this.showToast(e.message, 'error');
            if (qrArea) qrArea.innerHTML = `<div style="color:#ef4444; font-size:0.8rem; padding:10px; text-align:center;">⚠️ ${e.message}</div>`;
        } finally {
            if (btn) {
                btn.disabled = false;
                this.updateGeneratePixButtonText();
            }
        }
    },

    renderPixQR(data) {
        const qrArea = document.getElementById('qr-area');
        if (!qrArea) return;
        const isEn = this.getLang() === 'en';
        const imgSrc = data.qr_code_base64 
            ? `data:image/png;base64,${data.qr_code_base64}`
            : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data.qr_code || '')}`;

        qrArea.innerHTML = `
            <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-top:12px; text-align:center;">
                <div style="font-weight:700; font-size:0.82rem; color:#111827; margin-bottom:8px;">
                    ${isEn ? 'Scan the QR Code with your bank app:' : 'Escaneie o QR Code no app do seu banco:'}
                </div>
                <img src="${imgSrc}" alt="PIX QR Code" style="width:180px; height:180px; margin:0 auto; display:block; border-radius:8px; border:1px solid #e5e7eb;">
                
                <div style="margin-top:12px; text-align:left;">
                    <label style="display:block; font-size:0.75rem; font-weight:700; color:#4b5563; margin-bottom:4px;">
                        ${isEn ? 'Or copy the PIX code (Copia e Cola):' : 'Ou use o código Copia e Cola:'}
                    </label>
                    <div style="display:flex; gap:6px;">
                        <input type="text" readonly value="${data.qr_code || ''}" id="pixCopiaColaInput" style="flex:1; padding:7px 10px; font-size:0.72rem; border:1px solid #d1d5db; border-radius:6px; background:#f9fafb; color:#374151; outline:none; font-family:monospace; text-overflow:ellipsis;">
                        <button type="button" onclick="GoogleAuth.copyPixCode()" style="padding:7px 12px; background:#107c41; color:#fff; font-size:0.75rem; font-weight:700; border:none; border-radius:6px; cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                            <span>📋</span>
                            <span>${isEn ? 'Copy' : 'Copiar'}</span>
                        </button>
                    </div>
                </div>

                <div style="margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; font-size:0.78rem; color:#059669; font-weight:600;">
                    <span class="ga-spin">⏳</span>
                    <span>${isEn ? 'Waiting for payment... Auto-detecting confirmation.' : 'Aguardando pagamento... Reconhecimento automático em andamento.'}</span>
                </div>
            </div>
        `;
    },

    copyPixCode() {
        const input = document.getElementById('pixCopiaColaInput');
        const isEn = this.getLang() === 'en';
        if (!input || !input.value) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(input.value).then(() => {
                this.showToast(isEn ? 'PIX code copied to clipboard!' : 'Código PIX copiado com sucesso!', 'success');
            }).catch(() => {
                input.select();
                document.execCommand('copy');
                this.showToast(isEn ? 'PIX code copied to clipboard!' : 'Código PIX copiado com sucesso!', 'success');
            });
        } else {
            input.select();
            document.execCommand('copy');
            this.showToast(isEn ? 'PIX code copied to clipboard!' : 'Código PIX copiado com sucesso!', 'success');
        }
    },

    startPixPolling(paymentId) {
        this.stopPixPolling();
        const initialCredits = this.credits;
        const isEn = this.getLang() === 'en';

        this.pixPollingInterval = setInterval(async () => {
            if (!this.token) {
                this.stopPixPolling();
                return;
            }
            try {
                const res = await fetch('api/credits.php', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && typeof data.credits === 'number') {
                        if (data.credits > initialCredits) {
                            const added = data.credits - initialCredits;
                            this.credits = data.credits;
                            localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
                            this.updateCreditsBadge();
                            this.stopPixPolling();
                            this.closeCreditsModal();
                            this.showToast(
                                isEn ? `🎉 PIX confirmed! +${added} credits added.` : `🎉 PIX confirmado! +${added} créditos adicionados.`,
                                'success'
                            );
                        }
                    }
                }
            } catch (e) {
                console.warn('[GoogleAuth] PIX polling check error:', e);
            }
        }, 4000);
    },

    stopPixPolling() {
        if (this.pixPollingInterval) {
            clearInterval(this.pixPollingInterval);
            this.pixPollingInterval = null;
        }
    },

    // 12. PAYPAL SDK E SMART BUTTONS
    loadPayPalSDK() {
        if (window.paypal && typeof window.paypal.Buttons === 'function') {
            return Promise.resolve(window.paypal);
        }
        if (this.paypalPromise) {
            return this.paypalPromise;
        }

        this.paypalPromise = new Promise((resolve, reject) => {
            let elapsed = 0;
            const poller = setInterval(() => {
                elapsed += 100;
                if (window.paypal && typeof window.paypal.Buttons === 'function') {
                    clearInterval(poller);
                    resolve(window.paypal);
                } else if (elapsed >= 12000) {
                    clearInterval(poller);
                    this.paypalPromise = null;
                    reject(new Error('Timeout loading PayPal SDK'));
                }
            }, 100);

            let script = document.querySelector('script[src*="paypal.com/sdk/js"]');
            if (!script) {
                script = document.createElement('script');
                script.src = 'https://www.paypal.com/sdk/js?client-id=BAAsoqPW8MlsLqTNKrQMoPEeqyfKafERMBvspk51nt_y9eSMEKqFSOMNfzgMlg7ru7TOYtvj_FOtx5mFf0&currency=USD';
                script.async = true;
                script.onerror = (err) => {
                    clearInterval(poller);
                    this.paypalPromise = null;
                    reject(err);
                };
                document.head.appendChild(script);
            }
        });

        return this.paypalPromise;
    },

    renderPayPalButtons() {
        const container = document.getElementById('paypal-button-container');
        if (!container) return;

        const isEn = this.getLang() === 'en';
        container.innerHTML = `
            <div style="text-align:center; padding:14px; color:#6b7280; font-size:0.82rem;">
                <span class="ga-spin">⏳</span>
                ${isEn ? 'Loading PayPal & Card checkout...' : 'Carregando opções PayPal e Cartão...'}
            </div>
        `;

        this.loadPayPalSDK().then((paypal) => {
            if (!document.getElementById('paypal-button-container')) return;
            container.innerHTML = '';
            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    height: 42
                },
                createOrder: async () => {
                    if (!this.isLoggedIn() || !this.token) {
                        this.showToast(isEn ? 'Please sign in first.' : 'Faça login antes de comprar.', 'error');
                        this.openAuthModal(isEn ? 'AI Credits Recharge' : 'Recarga de Créditos de IA');
                        throw new Error('Not authenticated');
                    }
                    const res = await fetch('api/paypal_create_order.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: JSON.stringify({
                            package_index: this.selectedPackage
                        })
                    });
                    const data = await res.json();
                    if (!data.success || !data.order_id) {
                        throw new Error(data.error || (isEn ? 'Failed to create PayPal order' : 'Erro ao criar pedido PayPal'));
                    }
                    return data.order_id;
                },
                onApprove: async (data) => {
                    container.innerHTML = `
                        <div style="text-align:center; padding:16px; color:#2563eb; font-size:0.85rem; font-weight:700;">
                            <span class="ga-spin">⏳</span>
                            ${isEn ? 'Confirming payment with PayPal...' : 'Confirmando pagamento no PayPal...'}
                        </div>
                    `;
                    try {
                        const res = await fetch('api/paypal_capture_order.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${this.token}`
                            },
                            body: JSON.stringify({ order_id: data.orderID })
                        });
                        const captureData = await res.json();
                        if (captureData.success) {
                            this.credits = captureData.new_credits;
                            localStorage.setItem(this.STORAGE_CREDITS, String(this.credits));
                            this.updateCreditsBadge();
                            this.showToast(
                                isEn ? `🎉 +${captureData.credits_added} credits added!` : `🎉 +${captureData.credits_added} créditos adicionados!`,
                                'success'
                            );
                            setTimeout(() => this.closeCreditsModal(), 1200);
                        } else {
                            throw new Error(captureData.error || 'Capture failed');
                        }
                    } catch (err) {
                        this.showToast(err.message || 'Error capturing PayPal payment', 'error');
                        this.renderPayPalButtons();
                    }
                },
                onError: (err) => {
                    console.error('[GoogleAuth] PayPal error:', err);
                    this.showToast(isEn ? 'PayPal checkout error. Please try again.' : 'Erro no pagamento PayPal. Tente novamente.', 'error');
                }
            }).render('#paypal-button-container').catch((renderErr) => {
                console.error('[GoogleAuth] PayPal render error:', renderErr);
                container.innerHTML = `
                    <div style="color:#ef4444; font-size:0.8rem; text-align:center; padding:12px;">
                        ⚠️ ${isEn ? 'Could not render PayPal buttons.' : 'Não foi possível exibir botões PayPal.'}
                        <br><br>
                        <button type="button" onclick="GoogleAuth.renderPayPalButtons()" style="padding:6px 12px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:700;">
                            🔄 ${isEn ? 'Retry' : 'Tentar novamente'}
                        </button>
                    </div>
                `;
            });
        }).catch((err) => {
            console.error('[GoogleAuth] Failed to load PayPal SDK:', err);
            container.innerHTML = `
                <div style="color:#ef4444; font-size:0.8rem; text-align:center; padding:12px;">
                    ⚠️ ${isEn ? 'Could not load PayPal. Check ad-blocker or connection.' : 'Não foi possível carregar o PayPal. Verifique conexões ou bloqueadores de anúncio.'}
                    <br><br>
                    <button type="button" onclick="GoogleAuth.renderPayPalButtons()" style="padding:6px 12px; background:#f3f4f6; border:1px solid #d1d5db; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:700;">
                        🔄 ${isEn ? 'Retry' : 'Tentar novamente'}
                    </button>
                </div>
            `;
        });
    },

    // 13. NOTIFICAÇÕES VISUAIS TOAST RESILIENTES
    showToast(msg, type = 'info') {
        if (typeof App !== 'undefined' && typeof App.showToast === 'function') {
            App.showToast(msg);
            return;
        }

        let toast = document.getElementById('googleAuthGlobalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'googleAuthGlobalToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 100000;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 0.82rem;
                font-weight: 700;
                color: #ffffff;
                box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                transition: all 0.3s ease;
                pointer-events: none;
                opacity: 0;
                transform: translateY(12px);
                font-family: inherit;
            `;
            document.body.appendChild(toast);
        }

        const bgColors = {
            success: '#107c41',
            error: '#dc2626',
            info: '#1f2937'
        };
        toast.style.background = bgColors[type] || bgColors.info;
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(12px)';
        }, 4000);
    }
};

window.GoogleAuth = GoogleAuth;

// Auto-inicialização imediata quando o DOM estiver pronto
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            try { GoogleAuth.init(); } catch (e) { console.warn('[GoogleAuth] Auto-init:', e); }
        });
    } else {
        try { GoogleAuth.init(); } catch (e) { console.warn('[GoogleAuth] Auto-init:', e); }
    }
}
