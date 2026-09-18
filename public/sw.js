/**
 * RBE Connect Unified Service Worker (Standalone Portal)
 * Scope: /
 * 
 * 1. Imports OneSignal Web SDK v16 for native background lock-screen & desktop push
 * 2. Provides PWA offline asset caching and seamless network-first data retrieval
 * 3. Handles notification clicks and desktop window focus
 */

// 1. Cache Configuration
const CACHE_NAME = "rbe-connect-v2-pwa";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/images/site/favicon.png",
];

// Install: pre-cache essential connect assets and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map((url) => cache.add(url).catch(() => null))
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key.startsWith("rbe-connect-"))
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Cache same-origin assets or Google Fonts
  if (
    url.origin === self.location.origin ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    // Avoid caching API calls or OneSignal SDK requests
    if (
      url.hostname.includes("script.google.com") ||
      url.hostname.includes("onesignal.com")
    ) {
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.mode === "navigate") {
              return caches.match("/") || caches.match("/index.html");
            }
            return new Response("Offline", {
              status: 503,
              statusText: "Offline",
            });
          });
        })
    );
  }
});

// Message listener for skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
