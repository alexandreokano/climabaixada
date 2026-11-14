const C = 'clima-v15';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok && r.status === 200) {
          const c = r.clone();
          e.waitUntil(caches.open(C).then(x => x.put(e.request, c)));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || (e.request.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});