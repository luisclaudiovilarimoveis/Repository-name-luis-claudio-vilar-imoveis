const CACHE_NAME = "luis-claudio-vilar-site-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app-config.js",
  "./app.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/capa-app.png",
  "./assets/capa-mobile.png",
  "./assets/capa-tablet-vertical.png",
  "./assets/capa-tablet-horizontal.png",
  "./assets/capa-desktop.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/favicon-32.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("luis-claudio-vilar-site-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const networkFirst =
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/style.css") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/app-config.js") ||
    url.pathname.endsWith("/manifest.webmanifest");

  if (networkFirst) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(event.request)) ||
            (event.request.mode === "navigate"
              ? await caches.match("./offline.html")
              : Response.error())
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      );
    })
  );
});
