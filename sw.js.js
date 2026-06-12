// RUTA LIBRE — Service Worker v2.0
// Compatible con GitHub Pages (subcarpeta)

const CACHE_NAME = 'rutalibre-v2';
const BASE = self.location.pathname.replace('/sw.js', '');

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

// ── INSTALAR ──
self.addEventListener('install', e => {
  console.log('[SW] Instalando...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(url => cache.add(url).catch(err => console.log('[SW] No se pudo cachear:', url, err)))
        );
      })
      .then(() => {
        console.log('[SW] Instalado');
        return self.skipWaiting();
      })
  );
});

// ── ACTIVAR ──
self.addEventListener('activate', e => {
  console.log('[SW] Activando...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Borrando cache viejo:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH — Network first, cache fallback ──
self.addEventListener('fetch', e => {
  // No interceptar Firebase ni APIs externas
  if (e.request.url.includes('googleapis.com')) return;
  if (e.request.url.includes('firestore')) return;
  if (e.request.url.includes('firebase')) return;
  if (e.request.url.includes('gstatic.com')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request)
          .then(cached => cached || caches.match(BASE + '/index.html'));
      })
  );
});

// ── NOTIFICACIONES PUSH ──
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '🚗 RUTA LIBRE';
  const options = {
    body: data.body || 'Toca para ver la alerta',
    icon: BASE + '/icon-192.png',
    badge: BASE + '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'ruta-libre-alert',
    requireInteraction: data.urgent || false,
    data: { url: data.url || BASE + '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── CLICK EN NOTIFICACIÓN ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cls => {
      const url = e.notification.data?.url || BASE + '/';
      for (const client of cls) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

console.log('[SW] Script cargado correctamente v2.0');
