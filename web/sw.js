const CACHE_NAME = "speakeasy-shell-v1";

const ASSETS = [
  "/speakeasy/",
  "/speakeasy/index.html",
  "/speakeasy/manifest.webmanifest",
  "/assets/wake-emblem-original.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          // Cache same-origin static GETs.
          try {
            const url = new URL(request.url);
            if (url.origin === self.location.origin) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
            }
          } catch {}
          return res;
        })
        .catch(() => cached),
    }),
  );
});

