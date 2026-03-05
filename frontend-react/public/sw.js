const CACHE_NAME = 'eod-v1';
const APP_SHELL = ['/'];

// API-Prefixes die NICHT gecacht werden (dynamische Daten)
const API_PREFIXES = ['/search', '/alerts', '/search-alerts', '/price-history', '/api/', '/push-subscribe', '/test-telegram'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API-Calls immer direkt ans Netz
  if (API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return; // Kein event.respondWith → Browser-Standard (Netz)
  }

  // Alles andere: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      return cached || fetchPromise;
    })
  );
});

// Push-Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Emirates of Deals', body: 'Ein neuer Deal wartet!' };

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
