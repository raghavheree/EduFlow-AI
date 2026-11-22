// EduFlow AI - Progressive Web App Service Worker
const CACHE_NAME = 'eduflow-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for chrome extensions or non-HTTP schemes
  if (!url.protocol.startsWith('http')) return;

  // Supabase / External API requests: Network first, do not cache auth/private endpoints
  if (url.hostname.includes('supabase.co') || request.method !== 'GET') {
    return;
  }

  // Static assets & App Shell: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      const networkFetch = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback if network fails
        if (request.mode === 'navigate') {
          return cache.match('/index.html');
        }
        return null;
      });

      return cachedResponse || networkFetch;
    })
  );
});
