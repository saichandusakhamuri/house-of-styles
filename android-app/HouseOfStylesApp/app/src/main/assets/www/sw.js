const CACHE_NAME = "house-of-styles-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./vip.html",
  "./custom.html",
  "./custom-options.html",
  "./styles.css",
  "./script.js",
  "./vip.js",
  "./custom.js",
  "./custom-options.js",
  "./app.js",
  "./manifest.webmanifest",
  "./app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
