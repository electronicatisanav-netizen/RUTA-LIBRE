// ═══════════════════════════════════════════════════════════
// RUTA LIBRE — Service Worker
// ═══════════════════════════════════════════════════════════
// CÓMO ACTUALIZAR LA APP SIN ROMPER NADA:
// Cada vez que subas cambios a index.html / instalar.html / manifest.json,
// SOLO tenés que subir el número de esta constante (v6 -> v7 -> v8...).
// Eso hace que los celulares que ya tienen la app instalada descarguen
// la versión nueva automáticamente la próxima vez que la abran,
// en vez de quedarse pegados con una copia vieja en caché.
// NO edites nada más de este archivo salvo que sepas lo que hacés.
const CACHE_VERSION = 'rutalibre-v13';

// Archivos del "cascarón" de la app — se guardan para que funcione offline.
// admin-rutalibre.html queda afuera a propósito: el panel admin siempre
// debe mostrar datos frescos y no tiene sentido que funcione sin conexión.
const APP_SHELL = [
  './',
  './index.html',
  './instalar.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL: guarda el cascarón de la app ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: borra versiones de caché viejas ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres
          .filter(nombre => nombre.startsWith('rutalibre-') && nombre !== CACHE_VERSION)
          .map(nombre => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
// Estrategia:
// - Solo intervenimos en peticiones GET de nuestro propio origen (mismo dominio).
//   Todo lo de Firebase/Firestore/Google (otro dominio) pasa directo a la red,
//   sin tocarlo — cachear eso rompería el tiempo real de la app.
// - Para navegación (abrir la app) y el cascarón: intentamos red primero,
//   así el usuario recibe la versión más nueva apenas hay señal; si no hay
//   conexión, servimos la copia guardada para que la app abra igual.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // deja pasar Firebase, Google Fonts, etc.

  event.respondWith(
    fetch(req)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(req, copia));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});

// ── BACKGROUND SYNC ──
// Cuando vuelve la conexión, el navegador dispara este evento y le avisamos
// a la pestaña abierta para que vacíe la cola de alertas pendientes
// (la cola en sí vive en localStorage, del lado de index.html — acá solo avisamos).
self.addEventListener('sync', event => {
  if (event.tag === 'sync-alertas') {
    event.waitUntil(
      self.clients.matchAll().then(clientes => {
        clientes.forEach(c => c.postMessage({ type: 'SYNC_PENDIENTES' }));
      })
    );
  }
});

// ── MENSAJES DESDE LA APP ──
// Permite forzar la activación inmediata de una versión nueva si en el futuro
// agregás un botón de "Actualizar ahora" en vez de pedirle al usuario que recargue.
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
