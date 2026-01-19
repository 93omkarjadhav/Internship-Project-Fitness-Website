/**
 * Service Worker for Aggressive Image Caching
 * Caches images permanently so they load instantly on every visit/refresh
 */

const CACHE_NAME = 'fitfare-images-v1';
const IMAGE_CACHE_NAME = 'fitfare-images-cache-v1';

// Images to cache immediately
const IMAGES_TO_CACHE = [
  // Auth images
  '/image-1.webp',
  '/image-2.webp',
  '/forget-pass.webp',
  '/ladki - Edited.png',
  '/logo.png',
  '/image.png',
  '/sign-up.png',
  // Cloudinary club images (optimized)
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801943/fitfare/clubs/card-img.png',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801945/fitfare/clubs/gym-1.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801947/fitfare/clubs/gym-2.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801949/fitfare/clubs/gym-3.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801951/fitfare/clubs/gym-4.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801953/fitfare/clubs/gym-5.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801954/fitfare/clubs/gym-6.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801956/fitfare/clubs/gym-7.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801958/fitfare/clubs/gym-8.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801960/fitfare/clubs/gym-9.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801962/fitfare/clubs/gym-10.jpg',
  'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801964/fitfare/clubs/gym-11.jpg',
];

// Install event - cache images immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(IMAGE_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching images...');
      // Cache images with network-first, then cache fallback
      return Promise.allSettled(
        IMAGES_TO_CACHE.map((url) => {
          return fetch(url, { mode: 'no-cors' }).then((response) => {
            if (response.ok || response.type === 'opaque') {
              return cache.put(url, response);
            }
          }).catch(() => {
            // If fetch fails, try to cache the URL anyway for future use
            console.warn('[SW] Failed to cache:', url);
          });
        })
      );
    }).then(() => {
      console.log('[SW] Images cached successfully');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== IMAGE_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle image requests
  if (event.request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|jfif)$/i) ||
      url.hostname === 'res.cloudinary.com') {
    
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached version immediately if available
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache it
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache for future use
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // If network fails and no cache, return a placeholder or error
          console.warn('[SW] Network failed for:', event.request.url);
        });
      })
    );
  }
});


