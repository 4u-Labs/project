// Service Worker para ProjectClone - Suporte Offline Completo
const CACHE_NAME = 'projectclone-v1.3';

const ASSETS_TO_CACHE = [
  './',
  './index.php',
  './style.css',
  './icon.svg',
  './manifest.json',
  './js/i18n.js',
  './js/state.js',
  './js/engine.js',
  './js/gantt.js',
  './js/wbs-grid.js',
  './js/kanban.js',
  './js/resources.js',
  './js/dashboard.js',
  './js/calendar-view.js',
  './js/curva-s-eva.js',
  './js/io-msproject.js',
  './js/templates.js',
  './js/ai-assistant.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache parcial:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna cache e atualiza em background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.php');
        }
      });
    })
  );
});
