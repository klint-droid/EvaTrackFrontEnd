// PWA Service Worker Registration & Install Prompt Manager
let deferredPrompt = null;

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Register sw.js only in production or secure local contexts
      const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      );

      const swUrl = '/sw.js';

      if (window.location.protocol === 'https:' || isLocalhost) {
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('✅ EvaTrack PWA Service Worker registered:', registration.scope);

            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🚀 EvaTrack PWA update available.');
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('⚠️ PWA Service Worker registration skipped or failed:', error);
          });
      }
    });

    // Capture install prompt for PWA install button/banner
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      window.dispatchEvent(new CustomEvent('evatrack:pwa-installable', { detail: { installable: true } }));
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      console.log('🎉 EvaTrack PWA installed successfully');
      window.dispatchEvent(new CustomEvent('evatrack:pwa-installable', { detail: { installable: false } }));
    });
  }
}

export function promptPwaInstall() {
  if (!deferredPrompt) {
    return Promise.resolve({ outcome: 'dismissed', reason: 'no-prompt' });
  }

  deferredPrompt.prompt();
  return deferredPrompt.userChoice.then((choiceResult) => {
    deferredPrompt = null;
    return choiceResult;
  });
}

export function isPwaInstallAvailable() {
  return deferredPrompt !== null;
}
