/* eslint-env browser */
const CACHE_NAME = 'assets';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        // '/',
        '/assets/css/style-v1.css',
        '/assets/css/label-v1.css',
        '/assets/js/main-v1.js',
        '/ExModelo.xlsx',
        '/assets/fonts/ConnectCode39.ttf',
      ]),
    ),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.indexOf(CACHE_NAME) !== 0)
            .map(key => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request)),
  );
});
