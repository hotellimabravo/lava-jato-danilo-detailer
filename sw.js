// ==========================================================================
// Service Worker - Sistema de Gestão Multi-Empresas (PWA)
// ==========================================================================

const CACHE_NAME = 'gestao-saas-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/pedidos.html',
    '/agendamentos.html',
    '/caixa.html',
    '/clientes.html',
    '/servicos.html',
    '/estoque.html',
    '/fidelidade.html',
    '/configuracoes.html',
    '/style.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
    '/icon.svg',
    '/js/pwa-install.js',
    '/js/brand-service.js',
    '/js/auth-service.js',
    '/js/firebase-init.js',
    '/js/firebase-sync.js',
    '/js/empresa-service.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('Falha em alguns itens do pré-cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Apenas requisições GET
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Ignora chamadas externas ou de telemetria / Firebase
    if (!url.origin.includes(self.location.origin)) {
        return;
    }

    // Estratégia: Network First com fallback para Cache
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
