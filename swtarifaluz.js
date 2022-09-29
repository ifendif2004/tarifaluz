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
  "img/icon-192x192.png",
  "img/icon-256x256.png",
  "img/icon-384x384.png",
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