/**
 * Register Service Worker for Persistent Image Caching
 * This ensures images stay cached across refreshes, visits, and logouts
 */

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });
  } else {
    console.warn('⚠️ Service Workers not supported');
  }
};

/**
 * Pre-cache images using Cache API
 */
export const preCacheImages = async () => {
  if (!('caches' in window)) {
    return;
  }

  const images = [
    '/image-1.webp',
    '/image-2.webp',
    '/forget-pass.webp',
    '/logo.png',
    '/image.png',
    '/sign-up.png',
  ];

  try {
    const cache = await caches.open('fitfare-images-cache-v1');
    
    // Cache images in background
    images.forEach(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('✅ Cached:', url);
        }
      } catch (error) {
        console.warn('⚠️ Failed to cache:', url);
      }
    });
  } catch (error) {
    console.warn('⚠️ Cache API error:', error);
  }
};


