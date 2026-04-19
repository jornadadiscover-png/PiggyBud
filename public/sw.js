self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    } catch (error) {
      console.error('SW cleanup failed', error);
    }

    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    } catch (error) {
      console.error('SW client reload failed', error);
    }

    await self.registration.unregister();
  })());
});

self.addEventListener('fetch', () => {
  // Intentionally no-op: this file only exists to remove legacy service workers.
});
