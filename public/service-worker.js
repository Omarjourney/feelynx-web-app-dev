const CACHE_NAME = 'feelynx-cache-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/icons/feelynx-icon-512.png',
  '/icons/feelynx-icon-1024.png',
  '/icons/feelynx-favicon-196.png',
  '/icons/feelynx-apple-180.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
