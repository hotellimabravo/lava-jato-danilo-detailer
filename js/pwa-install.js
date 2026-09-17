// ==========================================================================
// PWA Install & Service Worker Management
// ==========================================================================

const PWAInstall = {
    deferredPrompt: null,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isIframe: false,
    swReady: false,

    init() {
        // 1. Detectar modo standalone (já instalado)
        this.isInstalled = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator && window.navigator.standalone === true);

        // 2. Detectar plataformas
        const ua = window.navigator.userAgent.toLowerCase();
        this.isIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
        this.isAndroid = /android/.test(ua);
        this.isIframe = window.self !== window.top;

        // 3. Registrar Service Worker de forma resiliente
        this.registrarServiceWorker();

        // 4. Capturar evento de instalação do Chrome / Android / Edge
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('[PWA] Evento beforeinstallprompt capturado com sucesso');
            this.renderInstallButtons(true);
        });

        // 5. Detectar quando o app for instalado com sucesso
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] Aplicativo instalado com sucesso pelo usuário');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.renderInstallButtons(false);
            this.fecharModal();
            this.mostrarToast('🎉 Aplicativo instalado com sucesso na sua tela inicial!');
        });

        // 6. Monitorar conectividade online / offline
        window.addEventListener('offline', () => {
            this.mostrarIndicadorOffline(true);
        });
        window.addEventListener('online', () => {
            this.mostrarIndicadorOffline(false);
            this.mostrarToast(' Conexão restabelecida! Dados sincronizados.');
        });
        if (!navigator.onLine) {
            this.mostrarIndicadorOffline(true);
        }

        // 7. Configurar interface ao carregar DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    },

    registrarServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[PWA] Service Workers não são suportados neste navegador.');
            return;
        }

        const runRegistration = () => {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((reg) => {
                    console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
                    this.swReady = true;

                    // Monitorar atualizações do Service Worker
                    reg.onupdatefound = () => {
                        const installingWorker = reg.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA] Nova versão detectada em segundo plano.');
                                }
                            };
                        }
                    };
                })
                .catch((err) => {
                    console.warn('[PWA] Falha no registro do Service Worker:', err);
                });
        };

        if (document.readyState === 'complete') {
            runRegistration();
        } else {
            window.addEventListener('load', runRegistration);
        }
    },

    setupUI() {
        if (this.isInstalled) {
            // Se já estiver instalado em tela cheia, garante que o botão não polui a tela
            this.renderInstallButtons(false);
            return;
        }

        // Injetar botão de instalação no header
        const headerActions = document.querySelector('.header-actions') || document.querySelector('.navbar');
        if (headerActions && !document.getElementById('btnPwaInstall')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'btnPwaInstall';
            btn.className = 'btn-pwa-install';
            btn.title = 'Instalar como aplicativo no Celular ou Computador';
            btn.innerHTML = `
                <span class="pwa-icon">📲</span>
                <span class="pwa-text">Instalar App</span>
            `;
            btn.onclick = () => this.solicitarInstalacao();

            if (headerActions.classList.contains('header-actions')) {
                headerActions.prepend(btn);
            } else {
                headerActions.appendChild(btn);
            }
        }

        // Exibir o botão
        this.renderInstallButtons(true);

        // Criar modal geral de instalação
        this.criarModalInstalacao();
    },

    renderInstallButtons(visible) {
        const btn = document.getElementById('btnPwaInstall');
        if (btn) {
            btn.style.display = (visible && !this.isInstalled) ? 'inline-flex' : 'none';
        }
    },

    async solicitarInstalacao() {
        // 1. Se o navegador já disparou o prompt nativo (Chrome/Edge/Android fora de iframe)
        if (this.deferredPrompt) {
            try {
                this.deferredPrompt.prompt();
                const choiceResult = await this.deferredPrompt.userChoice;
                if (choiceResult && choiceResult.outcome === 'accepted') {
                    console.log('[PWA] Usuário aceitou o prompt de instalação');
                    this.renderInstallButtons(false);
                } else {
                    console.log('[PWA] Usuário dispensou o prompt de instalação');
                }
                this.deferredPrompt = null;
                return;
            } catch (err) {
                console.error('[PWA] Erro ao invocar prompt nativo:', err);
            }
        }

        // 2. Caso contrário (iOS, iframe de preview, ou prompt ainda não liberado pelo Chrome):
        // Abrir modal com instruções visuais, link direto e botão de nova aba
        this.abrirModal();
    },

    criarModalInstalacao() {
        if (document.getElementById('modalPwaGeral')) return;

        const currentUrl = window.location.href;
        const currentOrigin = window.location.origin;

        const modal = document.createElement('div');
        modal.id = 'modalPwaGeral';
        modal.className = 'modal-backdrop';
        modal.style.display = 'none';
        modal.style.zIndex = '999999';

        modal.innerHTML = `
            <div class="modal-dialog pwa-dialog">
                <div class="pwa-dialog-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.8rem;">📲</span>
                        <div>
                            <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-main);">
                                Instalar Aplicativo (PWA)
                            </h3>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0 0;">
                                Acesso rápido na tela inicial, visual em tela cheia e suporte offline
                            </p>
                        </div>
                    </div>
                    <button type="button" class="btn-close-modal" onclick="window.PWAInstall.fecharModal()" style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: var(--text-muted);">&times;</button>
                </div>

                ${this.isIframe ? `
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 16px;">
                        <div style="font-weight: 700; font-size: 0.86rem; color: #1e40af; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>💡</span>
                            <span>Instalação Direta no Navegador</span>
                        </div>
                        <p style="font-size: 0.82rem; color: #1e3a8a; line-height: 1.45; margin: 0 0 10px 0;">
                            Para instalar o app no celular ou computador, o navegador exige que o sistema seja aberto diretamente em uma aba ou no próprio aparelho (janelas de teste bloqueiam a instalação nativa).
                        </p>
                        <a href="${currentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 700; padding: 8px 14px; border-radius: 6px;">
                            <span>🌐</span>
                            <span>Abrir em Nova Aba para Instalar</span>
                        </a>
                    </div>
                ` : ''}

                <!-- Abas de Navegação por Dispositivo -->
                <div class="pwa-platform-tabs">
                    <button type="button" class="pwa-tab-btn ${this.isAndroid ? 'active' : ''}" id="tabBtnAndroid" onclick="window.PWAInstall.trocarAba('android')">🤖 Android</button>
                    <button type="button" class="pwa-tab-btn ${this.isIOS ? 'active' : ''}" id="tabBtnIOS" onclick="window.PWAInstall.trocarAba('ios')">🍎 iPhone / iPad</button>
                    <button type="button" class="pwa-tab-btn ${(!this.isAndroid && !this.isIOS) ? 'active' : ''}" id="tabBtnPC" onclick="window.PWAInstall.trocarAba('pc')">💻 Computador (PC/Mac)</button>
                </div>

                <!-- Conteúdo Aba Android -->
                <div id="pwaTabAndroid" style="display: ${this.isAndroid ? 'block' : 'none'};">
                    <div class="pwa-step-box">
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">1</span>
                            <span>No <strong>Google Chrome</strong> do Android, toque no menu de <strong>três pontos (⋮)</strong> no canto superior direito.</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">2</span>
                            <span>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">3</span>
                            <span>Confirme clicando em <strong>"Instalar"</strong>. O ícone aparecerá entre seus aplicativos como um app nativo!</span>
                        </div>
                    </div>
                </div>

                <!-- Conteúdo Aba iOS -->
                <div id="pwaTabIOS" style="display: ${this.isIOS ? 'block' : 'none'};">
                    <div class="pwa-step-box">
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">1</span>
                            <span>Abra o sistema no navegador <strong>Safari</strong> do iPhone ou iPad.</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">2</span>
                            <span>Toque no ícone de <strong>Compartilhar (quadrado com seta para cima ⎋)</strong> na barra inferior.</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">3</span>
                            <span>Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início" ➕</strong>.</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">4</span>
                            <span>Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.</span>
                        </div>
                    </div>
                </div>

                <!-- Conteúdo Aba PC/Mac -->
                <div id="pwaTabPC" style="display: ${(!this.isAndroid && !this.isIOS) ? 'block' : 'none'};">
                    <div class="pwa-step-box">
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">1</span>
                            <span>No Google Chrome ou Microsoft Edge, localize o <strong>ícone de instalação (computador com seta ou ⊕)</strong> no lado direito da barra de endereços (ao lado da estrela).</span>
                        </div>
                        <div class="pwa-step-item">
                            <span class="pwa-step-num">2</span>
                            <span>Clique em <strong>"Instalar"</strong> para abrir o sistema em uma janela dedicada e fixar na barra de tarefas.</span>
                        </div>
                    </div>
                </div>

                <!-- Compartilhar / Copiar Link para o Celular -->
                <div style="margin-top: 14px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 14px;">
                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 6px;">
                        📲 Link para abrir diretamente no celular:
                    </label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="pwaShareUrlInput" readonly value="${currentUrl}" style="flex: 1; font-size: 0.8rem; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-muted);" />
                        <button type="button" class="btn btn-secondary" onclick="window.PWAInstall.copiarLink()" style="font-size: 0.8rem; padding: 6px 12px; white-space: nowrap;">
                            📋 Copiar
                        </button>
                    </div>
                </div>

                <!-- Status de Diagnóstico do PWA -->
                <div class="pwa-status-grid">
                    <div class="pwa-status-pill">
                        <span>✅</span>
                        <span>Manifesto PWA Ativo</span>
                    </div>
                    <div class="pwa-status-pill">
                        <span>⚡</span>
                        <span>Service Worker & Offline</span>
                    </div>
                    <div class="pwa-status-pill">
                        <span>🔒</span>
                        <span>Protocolo Seguro HTTPS</span>
                    </div>
                    <div class="pwa-status-pill">
                        <span>🎨</span>
                        <span>Ícones & Maskable Prontos</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
                    <button type="button" class="btn btn-primary" onclick="window.PWAInstall.fecharModal()" style="padding: 8px 20px;">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    trocarAba(platform) {
        const tabAndroid = document.getElementById('pwaTabAndroid');
        const tabIOS = document.getElementById('pwaTabIOS');
        const tabPC = document.getElementById('pwaTabPC');
        const btnAndroid = document.getElementById('tabBtnAndroid');
        const btnIOS = document.getElementById('tabBtnIOS');
        const btnPC = document.getElementById('tabBtnPC');

        if (tabAndroid) tabAndroid.style.display = platform === 'android' ? 'block' : 'none';
        if (tabIOS) tabIOS.style.display = platform === 'ios' ? 'block' : 'none';
        if (tabPC) tabPC.style.display = platform === 'pc' ? 'block' : 'none';

        if (btnAndroid) btnAndroid.classList.toggle('active', platform === 'android');
        if (btnIOS) btnIOS.classList.toggle('active', platform === 'ios');
        if (btnPC) btnPC.classList.toggle('active', platform === 'pc');
    },

    abrirModal() {
        this.criarModalInstalacao();
        const modal = document.getElementById('modalPwaGeral');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    fecharModal() {
        const modal = document.getElementById('modalPwaGeral');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    copiarLink() {
        const input = document.getElementById('pwaShareUrlInput');
        if (input) {
            input.select();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(input.value).then(() => {
                    this.mostrarToast('📋 Link copiado com sucesso!');
                }).catch(() => {
                    document.execCommand('copy');
                    this.mostrarToast('📋 Link copiado!');
                });
            } else {
                document.execCommand('copy');
                this.mostrarToast('📋 Link copiado!');
            }
        }
    },

    mostrarIndicadorOffline(isOffline) {
        let banner = document.getElementById('pwaOfflineBanner');
        if (isOffline) {
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'pwaOfflineBanner';
                banner.className = 'pwa-offline-banner';
                banner.innerHTML = `
                    <span>⚠️</span>
                    <span>Modo Offline Ativo — Os dados continuam seguros e acessíveis via cache local.</span>
                `;
                document.body.appendChild(banner);
            }
        } else {
            if (banner) {
                banner.remove();
            }
        }
    },

    mostrarToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'pwa-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }
};

window.PWAInstall = PWAInstall;
PWAInstall.init();

export default PWAInstall;
