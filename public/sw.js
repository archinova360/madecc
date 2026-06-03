const CACHE_NAME = 'madecc-onsite-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/favicon.png',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching structural offline shell...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Optional asset pre-cache skipped:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning legacy cache cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Standard Guard: skip unsupported schemes (e.g. chrome-extension://, data:, about:, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Focus caching on API store requests related to contracts, projects and web outputs
  if (url.pathname.includes('/api/store/contracts') || 
      url.pathname.includes('/api/store/projects') || 
      url.pathname.includes('/api/store/receipts') ||
      url.pathname.includes('/api/store/invoices') ||
      url.pathname.includes('/api/store/employees')) {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          console.warn('[Service Worker] Offline on-site detect: falling back to dynamic API cache for:', url.pathname);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // Return a valid JSON response so that offline queries do not crash downstream consumers
          return new Response(JSON.stringify({ offline: true, data: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // General static assets strategy: Network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Prevent TypeError: Failed to convert value to 'Response'
          return new Response('Network resources unavailable offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
