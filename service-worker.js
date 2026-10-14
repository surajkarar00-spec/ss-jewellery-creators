const CACHE_NAME = 'ss-jewellery-static-v3';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './products.js',
  './creator-upload.js',
  './supabase-config.js',
  './app.webmanifest',
  './app-icon.svg',
  './SUPABASE_SETUP.md',
  './supabase-setup.sql',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('ss-jewellery-static-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(new URL('./', self.registration.scope).pathname)
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
        throw new Error(`Offline asset is not cached: ${request.url}`);
      }),
  );
});
