// RUTA LIBRE — Service Worker v3.0
// Módulos: alertas + encomiendas + transporte + chat + PWA completa

const CACHE_NAME = 'rutalibre-v3';
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

// ── INSTALAR ──
self.addEventListener('install', e => {
  console.log('[SW v3] Instalando...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache =>
        Promise.allSettled(
          ASSETS.map(url =>
            cache.add(url).catch(err => console.log('[SW] No se pudo cachear:', url, err))
          )
        )
      )
      .then(() => {
        console.log('[SW v3] Instalado correctamente');
        return self.skipWaiting();
      })
  );
});

// ── ACTIVAR — borrar caches viejos ──
self.addEventListener('activate', e => {
  console.log('[SW v3] Activando...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Borrando cache viejo:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH — Network first, cache fallback ──
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // No interceptar Firebase ni APIs externas
  if (url.includes('googleapis.com')) return;
  if (url.includes('firestore.googleapis')) return;
  if (url.includes('firebase')) return;
  if (url.includes('gstatic.com')) return;
  if (url.includes('fonts.googleapis')) return;
  if (url.includes('wa.me')) return;
  if (url.includes('maps.google')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cachear respuestas exitosas
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin red — servir desde cache
        return caches.match(e.request)
          .then(cached => {
            if (cached) return cached;
            // Fallback a index.html para rutas de la app
            if (e.request.mode === 'navigate') {
              return caches.match(BASE + '/index.html');
            }
            return new Response('Sin conexión', { status: 503 });
          });
      })
  );
});

// ── NOTIFICACIONES PUSH ──
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

// ── MENSAJE DESDE LA APP ──
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

console.log('[SW] Cargado correctamente v3.0');
