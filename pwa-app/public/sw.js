/* BuyPeaceSign PWA — network-first shell (bps-v20-anchor-nudge) */
const CACHE = "bps-v20-anchor-nudge";
const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

function isNavigationRequest(request) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

function offlineFallback(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      return caches.match("/").then(
        (home) =>
          home ||
          new Response(
            "<!DOCTYPE html><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\"><title>BuyPeaceSign</title><body style=\"font-family:system-ui;padding:2rem;background:#F7F3EC;color:#2c2824\"><p>You're offline. Reconnect and refresh.</p></body>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
          ),
      );
    }
    return new Response("", { status: 504, statusText: "Offline" });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;

  // Navigations / HTML: network-first — never respond with undefined
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => offlineFallback(request)),
    );
    return;
  }

  // Static assets: network-first with safe offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => offlineFallback(request)),
  );
});
