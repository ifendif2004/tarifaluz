const STATIC_CACHE = "static-kwh";

const APP_SHELL = [
  "/",
  "index.html",
  "css/styles.css",
  "js/app.js",
  "img/bola.gif",
  "img/icon-192x192.png",
  "img/icon-256x256.png",
  "img/icon-384x384.png",
  "img/icon-512x512.png",
  "img/kwh.png",
  "img/naranja.png",
  "img/puntorojo.png",
  "img/rojo.png",
  "img/verde.png",
  "favicon.ico"
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));

  e.waitUntil(cacheStatic);
});

self.addEventListener("fetch", (e) => {
  console.log("fetch! ", e.request);
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