const CACHE_NAME = "safihub-courier-cache-v1";

const SHELL_URLS = [
  "/courier",
  "/courier/cash",
  "/courier/history",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS).catch(() => {
        // Continue even if some shell urls fail on first install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k.startsWith("safihub-courier-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests within courier area or next static assets
  if (event.request.method !== "GET") return;

  const isCourierScope = url.pathname.startsWith("/courier");
  const isStaticAsset = url.pathname.startsWith("/_next/static");

  if (!isCourierScope && !isStaticAsset) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (isCourierScope || isStaticAsset)
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failure: fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML navigation, return /courier shell
          if (event.request.mode === "navigate") {
            return caches.match("/courier");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});
