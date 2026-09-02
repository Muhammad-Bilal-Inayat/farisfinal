/**
 * Faris VIP Umrah Transport - High Performance Service Worker
 * Provides offline resilience, instant cached page loads, and static asset caching during travel.
 */

const CACHE_VERSION = 'faris-v2.2';
const STATIC_CACHE = `faris-static-${CACHE_VERSION}`;
const PAGES_CACHE = `faris-pages-${CACHE_VERSION}`;
const API_CACHE = `faris-api-${CACHE_VERSION}`;
const IMAGES_CACHE = `faris-images-${CACHE_VERSION}`;

const CORE_PAGES = [
  '/',
  '/about-us',
  '/vehicles',
  '/routes-rates',
  '/services',
  '/ziyarat',
  '/faq',
  '/contact',
  '/booking',
  '/terms',
  '/privacy',
];

const CORE_STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/image.png',
  '/robots.txt',
];

const READ_ONLY_API_ENDPOINTS = [
  '/api/settings',
  '/api/vehicles',
  '/api/routes',
  '/api/whatsapp',
  '/api/testimonials',
  '/api/page_custom'
];

// Helper to limit cache size
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      trimCache(cacheName, maxItems);
    }
  } catch (err) {
    // Ignore trim errors
  }
}

// 1. INSTALL: Precache core pages and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const pagesCache = await caches.open(PAGES_CACHE);

      // Precache static assets
      try {
        await staticCache.addAll(CORE_STATIC_ASSETS);
      } catch (err) {
        console.warn('[SW] Failed to precache some static assets:', err);
      }

      // Precache HTML pages with no-cache flag to get fresh copies
      const pagePromises = CORE_PAGES.map(async (url) => {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response && response.status === 200) {
            await pagesCache.put(url, response);
          }
        } catch (err) {
          console.warn(`[SW] Precache failed for page ${url}:`, err);
        }
      });

      await Promise.allSettled(pagePromises);
      return self.skipWaiting();
    })()
  );
});

// 2. ACTIVATE: Purge old cache stores
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, PAGES_CACHE, API_CACHE, IMAGES_CACHE];
  event.waitUntil(
    (async () => {
      const keyList = await caches.keys();
      await Promise.all(
        keyList.map((key) => {
          if (!currentCaches.includes(key)) {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      );
      return self.clients.claim();
    })()
  );
});

// 3. FETCH: Strategy Router
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST booking forms, logins)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, internal protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy A: Navigation requests (HTML pages) -> Network-First with quick timeout & Cache Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      (async () => {
        // Try network first with a 2.5 second timeout
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(null), 2500);
        });

        const fetchPromise = (async () => {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.status === 200) {
              const pagesCache = await caches.open(PAGES_CACHE);
              pagesCache.put(request, networkResponse.clone());
              // Also update root '/' if navigating to home
              if (url.pathname === '/') {
                pagesCache.put('/', networkResponse.clone());
              }
            }
            return networkResponse;
          } catch (err) {
            return null;
          }
        })();

        // Race fetch against timeout
        const networkResponse = await Promise.race([fetchPromise, timeoutPromise]);
        if (networkResponse) {
          return networkResponse;
        }

        // If network failed or timed out (travel intermittent connection), check page cache
        const cachedPage = await caches.match(request);
        if (cachedPage) {
          return cachedPage;
        }

        // Check if root shell exists
        const rootShell = await caches.match('/');
        if (rootShell) {
          return rootShell;
        }

        // Fallback to offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
          return offlinePage;
        }

        // Return basic fallback if nothing in cache
        return new Response(
          '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Faris VIP Umrah Transport</h1><p>You are currently offline. Please reconnect to continue.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return;
  }

  // Strategy B: Read-Only API Endpoints (/api/settings, /api/vehicles, /api/routes, etc.) -> Stale-While-Revalidate
  const isReadOnlyApi = READ_ONLY_API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
  if (isReadOnlyApi) {
    event.respondWith(
      (async () => {
        const apiCache = await caches.open(API_CACHE);
        const cachedResponse = await apiCache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              apiCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return cached response instantly if available, while updating cache in background
        if (cachedResponse) {
          // Trigger background fetch to keep fresh
          event.waitUntil(fetchPromise);
          return cachedResponse;
        }

        // If not in cache, wait for network
        const networkResponse = await fetchPromise;
        if (networkResponse) {
          return networkResponse;
        }

        // Return empty JSON fallback if completely offline with no cache
        return new Response(JSON.stringify({ offline: true, data: [] }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })()
    );
    return;
  }

  // Strategy C: Other API requests -> Network Only
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategy D: Images (Unsplash, local images, icons) -> Cache-First with Dynamic Cache
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/) ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      (async () => {
        const cachedImage = await caches.match(request);
        if (cachedImage) {
          return cachedImage;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const imagesCache = await caches.open(IMAGES_CACHE);
            imagesCache.put(request, networkResponse.clone());
            trimCache(IMAGES_CACHE, 80);
          }
          return networkResponse;
        } catch (err) {
          // If offline and image missing, return null or let browser handle
          return new Response('', { status: 408, statusText: 'Image Offline' });
        }
      })()
    );
    return;
  }

  // Strategy E: Static Assets (JS scripts, CSS styles, fonts) -> Cache-First / Stale-While-Revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      (async () => {
        const staticCache = await caches.open(STATIC_CACHE);
        const cachedAsset = await staticCache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              staticCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedAsset) {
          event.waitUntil(fetchPromise);
          return cachedAsset;
        }

        const networkResponse = await fetchPromise;
        if (networkResponse) {
          return networkResponse;
        }

        return cachedAsset || new Response('', { status: 503 });
      })()
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() => {
          return new Response('Offline content unavailable', { status: 503 });
        })
      );
    })
  );
});

// 4. Communication: Messages from Client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
