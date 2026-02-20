/**
 * Service Worker para Tarifa Luz
 * Maneja el almacenamiento en caché de los activos estáticos para funcionamiento offline.
 */

const CACHE_NAME = "tarifaluz-v2"; // Incrementado para forzar actualización

// Activos mínimos necesarios para que la "App Shell" funcione
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./img/bola.gif",
  "./img/kwh.png",
  "https://cdn.jsdelivr.net/npm/chart.js"
];

// Instalación: Almacena activos estáticos en caché
self.addEventListener("install", (e) => {
  const cacheStatic = caches.open(CACHE_NAME)
    .then((cache) => cache.addAll(APP_SHELL));

  e.waitUntil(cacheStatic);
});

// Activación: Limpia cachés antiguos
self.addEventListener("activate", (e) => {
  const cleanup = caches.keys().then((keys) => {
    return Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log("[SW] Borrando caché antiguo:", key);
          return caches.delete(key);
        }
      })
    );
  });
  e.waitUntil(cleanup);
});

// Fetch: Estrategia de Cache First, luego Network
self.addEventListener("fetch", (e) => {
  // Solo cacheamos peticiones GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((res) => {
      // Si está en caché, lo devolvemos; si no, vamos a la red
      return res || fetch(e.request).then(networkRes => {
        // Opcional: Podríamos cachear dinámicamente aquí
        return networkRes;
      });
    }).catch(err => {
      console.error("[SW] Error en fetch:", err);
    })
  );
});
