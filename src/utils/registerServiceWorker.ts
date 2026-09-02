export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('[SW] Service Worker unregistered to prevent cache conflicts.');
      }
    });
    
    // Also clear caches
    if ('caches' in window) {
      caches.keys().then((keys) => {
        Promise.all(keys.map((k) => caches.delete(k))).then(() => {
          console.log('[SW] Caches cleared.');
        });
      });
    }
  }
}

export function clearAppCache(): Promise<boolean> {
  return new Promise(async (resolve) => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        resolve(true);
      } catch {
        resolve(false);
      }
    } else {
      resolve(true);
    }
  });
}
