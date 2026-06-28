// RUTA LIBRE — Service Worker v4.0
// Optimizado: offline-first, cola de alertas, sincronización automática

const CACHE_NAME = 'rutalibre-v4';
const BASE = self.location.pathname.replace('/sw.js', '');

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/admin-rutalibre.html',
  BASE + '/instalar.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

// Cola de alertas pendientes (cuando no hay señal)
let alertasPendientes = [];

// ── INSTALAR ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(ASSETS.map(url =>
        cache.add(url).catch(() => {})
      )))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVAR ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-first para assets, Network-first para datos ──
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Pasar Firebase y APIs externas directamente
  if (url.includes('googleapis.com') || url.includes('firestore') ||
      url.includes('firebase') || url.includes('gstatic.com') ||
      url.includes('fonts.googleapis') || url.includes('wa.me') ||
      url.includes('maps.google') || e.request.method !== 'GET') return;

  // Cache-first para assets estáticos (rápido con poca señal)
  const isAsset = ASSETS.some(a => url.endsWith(a.replace(BASE,'')));
  if (isAsset) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-first para el resto (intenta red, cae a cache)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)
        .then(cached => cached || caches.match(BASE + '/index.html'))
      )
  );
});

// ── SINCRONIZACIÓN EN BACKGROUND (cuando recupera señal) ──
self.addEventListener('sync', e => {
  if (e.tag === 'sync-alertas') {
    e.waitUntil(sincronizarAlertas());
  }
});

async function sincronizarAlertas() {
  // Notificar a los clientes que sincronicen la cola pendiente
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.postMessage({ type: 'SYNC_PENDIENTES' }));
}

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '🚗 RUTA LIBRE';
  const options = {
    body: data.body || 'Toca para ver la novedad',
    icon: BASE + '/icon-192.png',
    badge: BASE + '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'ruta-libre-alert',
    requireInteraction: data.urgent || false,
    silent: false,
    data: { url: data.url || BASE + '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// ── CLICK EN NOTIFICACIÓN ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      const url = e.notification.data?.url || BASE + '/';
      for (const client of cls) {
        if (client.url.includes(BASE) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'PUSH_CLICK', url });
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── MENSAJES DESDE LA APP ──
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'GUARDAR_ALERTA_PENDIENTE') {
    alertasPendientes.push(e.data.alerta);
  }
});

console.log('[SW] RUTA LIBRE v4.0 — Optimizado offline');
