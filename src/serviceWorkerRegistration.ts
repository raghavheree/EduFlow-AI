// Service Worker registration helper for EduFlow AI PWA

export function registerServiceWorker(onSuccess?: () => void, onUpdate?: () => void) {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; please refresh.
                  console.info('[EduFlow AI PWA] New update available.');
                  if (onUpdate) onUpdate();
                } else {
                  // Content is cached for offline use.
                  console.info('[EduFlow AI PWA] Cached for offline use.');
                  if (onSuccess) onSuccess();
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[EduFlow AI PWA] Service Worker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
