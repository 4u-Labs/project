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

    init() {
        this.loadStoredSession();
        this.initTokenClient();
        this.renderAuthUI();
        this.syncWithBackend();

        if (this._initialized) return;
        this._initialized = true;

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

            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast(this.getLang() === 'en' ? `Welcome, ${this.currentUser.name}!` : `Bem-vindo(a), ${this.currentUser.name}!`);
            }

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

        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(this.getLang() === 'en' ? 'Logged out successfully.' : 'Desconectado com sucesso.');
        }
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

    // 7. RENDERIZADOR SEGURO DE AVATAR (NUNCA exibe ícone 4U gigante)
    getAvatarHtml(name, picture, size = 22) {
        const initial = (name || 'U').trim().charAt(0).toUpperCase();
        const initialBadge = `<div class="user-avatar-initial" style="width:${size}px; height:${size}px; line-height:${size}px; border-radius:50%; background:linear-gradient(135deg, #107c41, #059669); color:#fff; font-weight:800; font-size:${Math.round(size * 0.48)}px; text-align:center; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">${initial}</div>`;

        // Se for nulo, vazio, gravatar genérico ou tiver referência a "4u", usa a inicial do usuário
        if (!picture || typeof picture !== 'string' || picture.toLowerCase().includes('4u') || picture.toLowerCase().includes('gravatar.com')) {
            return initialBadge;
        }

        // Renderiza com fallback seguro caso a imagem do Google expire ou falhe
        return `<img src="${picture}" alt="${name}" class="user-avatar-img" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; display:inline-block; flex-shrink:0;" onerror="this.outerHTML='<div class=\\'user-avatar-initial\\' style=\\'width:${size}px; height:${size}px; line-height:${size}px; border-radius:50%; background:linear-gradient(135deg, #107c41, #059669); color:#fff; font-weight:800; font-size:${Math.round(size * 0.48)}px; text-align:center; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;\\'>${initial}</div>'">`;
    },

    // 8. RENDERIZAÇÃO DA INTERFACE (HEADER)
    renderAuthUI() {
        const container = document.getElementById('googleAuthContainer');
        if (!container) return;

        const isEn = this.getLang() === 'en';

        if (!this.isLoggedIn()) {
            container.innerHTML = `
                <button type="button" onclick="GoogleAuth.signIn()" class="btn-google-login" title="${isEn ? 'Sign in with Google to sync 4U AI credits' : 'Entrar com Conta Google e sincronizar créditos de IA'}">
                    <svg viewBox="0 0 24 24" width="14" height="14" class="google-svg">
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
            const creditsText = this.isAdmin() ? '∞ VIP' : `${this.credits}`;

            container.innerHTML = `
                <div class="google-auth-user-wrap">
                    <!-- 1. Badge de Saldo de Créditos IA -->
                    <button type="button" onclick="GoogleAuth.openCreditsModal('balance')" class="btn-credits-badge" title="${isEn ? 'Your credits balance (Click to manage)' : 'Seus créditos de IA (Clique para ver saldo)'}">
                        <span class="credits-gem">💎</span>
                        <span id="creditsCountDisplay" class="credits-num">${creditsText}</span>
                        <span class="credits-lbl">${isEn ? 'cr' : 'créd'}</span>
                    </button>

                    <!-- 2. Botão COMPRAR CRÉDITOS DIRETO -->
                    <button type="button" onclick="GoogleAuth.openCreditsModal('buy')" class="btn-buy-credits" title="${isEn ? 'Buy AI Credits' : 'Comprar Créditos de IA'}">
                        <span>⚡</span>
                        <span>${isEn ? 'Buy Credits' : 'Comprar Créditos'}</span>
                    </button>

                    <!-- 3. Botão Perfil Usuário -->
                    <button type="button" id="userAvatarBtn" onclick="GoogleAuth.toggleUserDropdown()" class="btn-user-avatar" title="${name}">
                        ${this.getAvatarHtml(name, avatar, 22)}
                        <span class="user-display-name">${name}</span>
                        <i class="fa-solid fa-chevron-down user-chevron"></i>
                    </button>

                    <!-- 4. Dropdown de Usuário -->
                    <div id="userDropdownMenu" class="user-dropdown-menu hidden">
                        <div class="user-dropdown-header">
                            ${this.getAvatarHtml(name, avatar, 36)}
                            <div class="user-dropdown-meta">
                                <div class="user-name-title">${this.currentUser.name || name}</div>
                                <div class="user-email-subtitle">${this.currentUser.email}</div>
                                <span class="user-role-badge ${this.isAdmin() ? 'vip' : ''}">
                                    ${this.isAdmin() ? '⭐ Admin VIP' : 'Conta 4U'}
                                </span>
                            </div>
                        </div>

                        <div class="user-dropdown-body">
                            <div class="user-balance-row">
                                <span class="balance-lbl">${isEn ? 'AI Credits:' : 'Saldo de Créditos:'}</span>
                                <span class="balance-val">💎 ${this.isAdmin() ? '∞ VIP' : `${this.credits} ${isEn ? 'credits' : 'créditos'}`}</span>
                            </div>
                            <button type="button" onclick="GoogleAuth.openCreditsModal('buy'); GoogleAuth.closeUserDropdown();" class="user-menu-item highlight">
                                <span>⚡ ${isEn ? 'Buy / Recharge Credits' : 'Comprar / Recarregar Créditos'}</span>
                            </button>
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
            <div>
                <button onclick="GoogleAuth.closeAuthModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.1rem; color: #9ca3af; cursor: pointer; font-weight: bold;">✕</button>
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
    },

    closeAuthModal() {
        const modal = document.getElementById('googleAuthPromptModal');
        if (modal) modal.classList.add('hidden');
    },

    // 10. MODAL DE CRÉDITOS & COMPRA
    openCreditsModal(type = 'balance') {
        let modal = document.getElementById('creditsInfoModal');
        const isEn = this.getLang() === 'en';

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'creditsInfoModal';
            document.body.appendChild(modal);
        }

        const isInsuf = (type === 'insufficient');
        const creditsText = this.isAdmin() ? '∞ VIP' : `${this.credits}`;

        modal.innerHTML = `
            <div>
                <button onclick="GoogleAuth.closeCreditsModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.1rem; color: #9ca3af; cursor: pointer; font-weight: bold;">✕</button>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: ${isInsuf ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.15)'}; color: ${isInsuf ? '#dc2626' : '#d97706'}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                        ${isInsuf ? '⚠️' : '💎'}
                    </div>
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #111827; margin: 0;">
                            ${isInsuf ? (isEn ? 'Insufficient AI Credits' : 'Créditos de IA Insuficientes') : (isEn ? '4U Ecosystem Credits' : 'Créditos de Inteligência Artificial')}
                        </h3>
                        <p style="font-size: 0.75rem; color: #6b7280; margin: 2px 0 0 0;">
                            ${isEn ? 'Unified balance for ProjectClone, ExcelClone, WordClone, FreePDF, KeepAi' : 'Saldo unificado para ProjectClone, ExcelClone, WordClone, FreePDF e KeepAi'}
                        </p>
                    </div>
                </div>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.8rem; color: #4b5563; font-weight: 600;">${isEn ? 'Current Balance:' : 'Seu Saldo Atual:'}</span>
                    <span style="font-size: 1rem; font-weight: 800; color: #d97706;">💎 ${creditsText} ${isEn ? 'credits' : 'créditos'}</span>
                </div>

                <div style="margin-bottom: 16px;">
                    <div style="font-size: 0.78rem; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em;">
                        ${isEn ? 'Available Credit Packages:' : 'Pacotes de Créditos Disponíveis:'}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.8rem;">
                            <span style="font-weight: 700; color: #111827;">💎 10 Créditos</span>
                            <span style="color: #059669; font-weight: 800;">R$ 4,90 <span style="font-size: 0.7rem; color: #6b7280; font-weight: 500;">(R$ 0,49/un)</span></span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 0.8rem;">
                            <div>
                                <span style="font-weight: 700; color: #92400e;">💎 50 Créditos</span>
                                <span style="margin-left: 6px; font-size: 0.65rem; background: #f59e0b; color: #fff; padding: 1px 5px; border-radius: 9999px; font-weight: 700;">MAIS POPULAR</span>
                            </div>
                            <span style="color: #b45309; font-weight: 800;">R$ 19,90 <span style="font-size: 0.7rem; color: #78350f; font-weight: 500;">(R$ 0,39/un)</span></span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.8rem;">
                            <div>
                                <span style="font-weight: 700; color: #111827;">💎 100 Créditos</span>
                                <span style="margin-left: 6px; font-size: 0.65rem; background: #107c41; color: #fff; padding: 1px 5px; border-radius: 9999px; font-weight: 700;">MELHOR VALOR</span>
                            </div>
                            <span style="color: #059669; font-weight: 800;">R$ 34,90 <span style="font-size: 0.7rem; color: #6b7280; font-weight: 500;">(R$ 0,34/un)</span></span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="https://4u.ia.br/app/office/keepai/" target="_blank" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; border-radius: 8px; font-size: 0.85rem; font-weight: 800; text-decoration: none; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35); cursor: pointer; text-align: center;">
                        <span>💳 ${isEn ? 'Buy Credits (KeepAi / PIX / Card)' : 'Comprar Créditos (PIX / Cartão)'}</span>
                    </a>
                    <button type="button" onclick="GoogleAuth.closeCreditsModal()" style="width: 100%; padding: 8px; text-align: center; font-size: 0.8rem; color: #6b7280; background: none; border: none; cursor: pointer;">
                        ${isEn ? 'Close' : 'Fechar'}
                    </button>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    },

    closeCreditsModal() {
        const modal = document.getElementById('creditsInfoModal');
        if (modal) modal.classList.add('hidden');
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
