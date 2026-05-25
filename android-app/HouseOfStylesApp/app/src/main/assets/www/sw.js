const CACHE_NAME = "house-of-styles-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./vip.html",
  "./custom.html",
  "./custom-options.html",
  "./styles.css",
  "./runtime-config.js",
  "./script.js",
  "./vip.js",
  "./custom.js",
  "./custom-options.js",
  "./app.js",
  "./manifest.webmanifest",
  "./app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }

  if (request.destination === "style" || request.destination === "script") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(caches.match(request).then((response) => response || fetch(request)));
});
