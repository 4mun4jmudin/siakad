const CACHE_NAME = 'siakad-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/images/l.png',
    // Fallback offline page or assets can be added here
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If valid response, clone and cache it
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                let responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                return response;
            })
            .catch(() => {
                // If network fails, try to return cached response
                return caches.match(event.request);
            })
    );
});
