const CACHE_NAME = 'cookies-bakery-offline-pro-v4';

// 1. Assets that MUST be cached immediately on install
// Note: In production (Vercel), index.tsx is compiled into JS bundles.
// We removed '/index.tsx' from here to prevent 404 errors during SW install.
// The compiled JS files will be cached dynamically by the fetch handler below.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

// 2. Domains that host our external libraries (CDNs).
// We will dynamically cache anything fetched from these domains.
const EXTERNAL_DOMAINS = [
  'cdn.tailwindcss.com',
  'aistudiocdn.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

// Install Event: Cache core files immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching core assets');
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

// Fetch Event: The Brain of Offline Mode
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Check if the request is for one of our external CDNs or our own origin
  const isExternalAsset = EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain));
  const isLocalAsset = url.origin === self.location.origin;

  if (isExternalAsset || isLocalAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          
          // STRATEGY: Stale-While-Revalidate
          // 1. Return cached response immediately if available (Fast & Offline works)
          // 2. Fetch from network in background to update cache for next time
          
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Validate response before caching
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              // Network failed. If we don't have a cached response, we are in trouble.
              // But if we returned cachedResponse below, the user is fine.
              console.log('[ServiceWorker] Network fetch failed (offline mode active)');
            });

          // Return cached response if we have it, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});