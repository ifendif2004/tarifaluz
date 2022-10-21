const STATIC_CACHE = "static-kwh";

const APP_SHELL = [
  "/",
  "index.html",
  "favicon.ico",
  "swtarifaluz.js",
  "manifest.json",
  "css/styles.css",
  "js/app.js",
  "img/bola.gif",
  "img/icon-48x48.png",
  "img/icon-72x72.png",
  "img/icon-96x96.png",
  "img/icon-128x128.png",
  "img/icon-144x144.png",
  "img/icon-152x152.png",
  "img/icon-192x192.png",
  "img/icon-256x256.png",
  "img/icon-284x284.png",
  "img/maskable-icon-384x384.png",
  "img/icon-512x512.png",
  "img/kwh.png",
  "img/cuadradoNaranja.png",
  "img/puntorojo.png",
  "img/cuadradoVerde.png"
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));

  e.waitUntil(cacheStatic);
});

self.addEventListener("fetch", (e) => {
  // console.log("fetch! ", e.request);
  e.respondWith(
    caches
      .match(e.request)
      .then((res) => {
        return res || fetch(e.request);
      })
      .catch(console.log)
  );
  //   e.waitUntil(response);
});