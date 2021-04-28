/*importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

if (workbox) {

  console.log('Workbox loaded!');

  workbox.core.setCacheNameDetails({
    prefix: 'Vacunación Covid-19 España',
    suffix: 'v2.0',
    precache: 'precache-cache',
    runtime: 'runtime-cache'
  });

  workbox.precaching.precacheAndRoute([
    //{ url: '/', revision: null },
    //{ url: '/css/styles.css', revision: null },
    //{ url: '/texts.json', revision: null },
    //{ url: '/icons/favicon-32x32.png', revision: null },
    //{ url: '/icons/favicon-16x16.png', revision: null },
    //{ url: '/icons/icon512.png', revision: null },
    { url: '/offline.html', revision: null }
  ]);

  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/'),
    new workbox.strategies.NetworkOnly()
  );

  workbox.recipes.offlineFallback();

} else {
  console.log(`Can't load Workbox`);
}*/

const SW_VERSION = '2021-03-11-04';
const CACHE_NAME = 'offline';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
  })());
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  console.log('[Service Worker] Fetch', event.request.url);
  
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log('[Service Worker] Fetch failed; returning offline page instead.', error);

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  }
});
