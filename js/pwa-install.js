// ==========================================================================
// PWA Install & Service Worker Management
// ==========================================================================

const PWAInstall = {
    deferredPrompt: null,
    isInstalled: false,
    isIOS: false,

    init() {
        // 1. Detectar modo standalone (já instalado)
        this.isInstalled = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator && window.navigator.standalone === true);

        // 2. Detectar iOS (Safari)
        const ua = window.navigator.userAgent.toLowerCase();
        this.isIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;

        // 3. Registrar Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('Service Worker registrado com sucesso (escopo):', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('Falha no registro do Service Worker:', err);
                    });
            });
        }

        // 4. Capturar evento de instalação do Chrome / Android / Edge
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.renderInstallButtons(true);
        });

        // 5. Detectar quando o app for instalado
        window.addEventListener('appinstalled', () => {
            console.log('PWA instalado com sucesso pelo usuário');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.renderInstallButtons(false);
            this.mostrarToast('🎉 Aplicativo instalado com sucesso na sua tela inicial!');
        });

        // 6. Inserir botão na barra superior e criar modal do iOS
        document.addEventListener('DOMContentLoaded', () => {
            this.setupUI();
        });
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this.setupUI();
        }
    },

    setupUI() {
        if (this.isInstalled) return;

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

            // Insere antes do headerActions ou no navbar
            if (headerActions.classList.contains('header-actions')) {
                headerActions.prepend(btn);
            } else {
                headerActions.appendChild(btn);
            }
        }

        // Se for iOS e não instalado, o botão deve ficar visível para exibir o guia
        if (this.isIOS && !this.isInstalled) {
            this.renderInstallButtons(true);
        }

        // Criar modal de instruções para iOS
        this.criarModalIOS();
    },

    renderInstallButtons(visible) {
        const btn = document.getElementById('btnPwaInstall');
        if (btn) {
            btn.style.display = (visible && !this.isInstalled) ? 'inline-flex' : 'none';
        }
    },

    async solicitarInstalacao() {
        if (this.deferredPrompt) {
            // Android, Windows, Mac, Chrome, Edge
            try {
                this.deferredPrompt.prompt();
                const choiceResult = await this.deferredPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou instalar o PWA');
                    this.renderInstallButtons(false);
                } else {
                    console.log('Usuário recusou o prompt de instalação');
                }
                this.deferredPrompt = null;
            } catch (err) {
                console.error('Erro ao acionar instalação:', err);
            }
        } else if (this.isIOS) {
            // iOS Safari precisa do guia manual
            this.abrirModalIOS();
        } else {
            // Desktop ou navegador sem prompt pendente (ex: já acessando ou navegador sem suporte nativo)
            alert('Para instalar este sistema:\n\n• No Computador: Clique no ícone de computador/instalação no canto direito da barra de endereço do navegador.\n• No Celular Android: Abra o menu do Chrome (três pontinhos) e clique em "Instalar aplicativo" ou "Adicionar à tela inicial".');
        }
    },

    criarModalIOS() {
        if (document.getElementById('modalPwaIOS')) return;

        const modal = document.createElement('div');
        modal.id = 'modalPwaIOS';
        modal.className = 'modal-backdrop';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-dialog pwa-ios-dialog" style="max-width: 420px; width: 90%; text-align: center; padding: 24px;">
                <div style="font-size: 2.4rem; margin-bottom: 8px;">📲</div>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
                    Instalar no seu iPhone / iPad
                </h3>
                <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 18px;">
                    Instale como aplicativo nativo na sua tela de início sem precisar da App Store:
                </p>

                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; text-align: left; display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; font-size: 0.85rem;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: #e2e8f0; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
                        <span>Toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta ⎋) na barra inferior do Safari.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: #e2e8f0; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
                        <span>Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> ➕.</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: #e2e8f0; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
                        <span>Toque em <strong>Adicionar</strong> no canto superior direito para finalizar.</span>
                    </div>
                </div>

                <button type="button" class="btn btn-primary" style="width: 100%;" onclick="PWAInstall.fecharModalIOS()">
                    Entendi!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirModalIOS() {
        const modal = document.getElementById('modalPwaIOS');
        if (modal) modal.style.display = 'flex';
    },

    fecharModalIOS() {
        const modal = document.getElementById('modalPwaIOS');
        if (modal) modal.style.display = 'none';
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
