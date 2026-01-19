/**
 * Synchronous Image Cache Checker
 * Checks if image is in browser cache BEFORE React renders
 * Returns cached blob URL for instant display
 */

/**
 * Check if image is already loaded in browser cache (synchronous check)
 */
export const isImageCached = (src: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const img = new Image();
  img.src = src;
  // If image is complete, it's in cache
  return img.complete || img.naturalWidth > 0;
};

/**
 * Get cached image as blob URL from service worker (async but fast)
 */
export const getCachedImageBlob = async (src: string): Promise<string | null> => {
  if (!('caches' in window)) return null;
  
  try {
    const cache = await caches.open('fitfare-images-cache-v1');
    const cached = await cache.match(src);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {
    // Cache check failed
  }
  
  return null;
};

/**
 * Preload image and ensure it's in browser cache
 * Returns true if image is ready, false if still loading
 */
export const ensureImageCached = (src: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if already cached
  if (isImageCached(src)) {
    return true;
  }
  
  // Force into cache immediately
  for (let i = 0; i < 10; i++) {
    const img = new Image();
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = src;
  }
  
  // Also create link preload
  const existingLink = document.querySelector(`link[rel="preload"][as="image"][href="${src}"]`);
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if ('fetchPriority' in link) {
      (link as any).fetchPriority = 'high';
    }
    document.head.appendChild(link);
  }
  
  return false;
};


