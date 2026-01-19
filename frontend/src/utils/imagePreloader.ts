/**
 * Image Preloader Utility
 * Preloads images to eliminate load delays with multiple strategies
 * Includes persistent caching via Cache API and localStorage
 */

// Track preloaded images to avoid duplicates
const preloadedImages = new Set<string>();

// Cache API for persistent image storage
const IMAGE_CACHE_NAME = 'fitfare-images-cache-v1';

/**
 * Cache image using Cache API (persists across refreshes/logouts)
 */
const cacheImage = async (url: string): Promise<void> => {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cached = await cache.match(url);
    
    // If not cached, fetch and cache it
    if (!cached) {
      try {
        const response = await fetch(url, { 
          mode: 'cors',
          credentials: 'omit'
        });
        if (response.ok) {
          await cache.put(url, response.clone());
          // Also store URL in localStorage for quick reference
          const cachedUrls = JSON.parse(localStorage.getItem('cachedImageUrls') || '[]');
          if (!cachedUrls.includes(url)) {
            cachedUrls.push(url);
            localStorage.setItem('cachedImageUrls', JSON.stringify(cachedUrls));
          }
        }
      } catch (error) {
        // Silently fail for CORS or network errors
        console.warn('[ImagePreloader] Failed to cache:', url);
      }
    }
  } catch (error) {
    // Silently fail if Cache API is not available
  }
};

/**
 * Get cached image from Cache API
 */
const getCachedImage = async (url: string): Promise<Response | null> => {
  if (!('caches' in window)) {
    return null;
  }

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    return await cache.match(url);
  } catch (error) {
    return null;
  }
};

/**
 * Preload image using HTML link tag (fastest method)
 */
const preloadImageWithLink = (src: string): void => {
  if (!src || src.startsWith('data:') || preloadedImages.has(src)) {
    return;
  }

  // Check if link already exists
  const existingLink = document.querySelector(`link[rel="preload"][as="image"][href="${src}"]`);
  if (existingLink) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  // Set fetchPriority if supported
  if ('fetchPriority' in link) {
    (link as any).fetchPriority = 'high';
  }
  document.head.appendChild(link);
  preloadedImages.add(src);
};

/**
 * Preload a single image using multiple methods for maximum speed
 * Includes persistent caching via Cache API
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    // Skip if already cached or invalid
    if (!src || src.startsWith('data:')) {
      resolve();
      return;
    }

    // Check Cache API first (instant if cached)
    getCachedImage(src).then((cached) => {
      if (cached) {
        // Image is cached - create blob URL for instant display
        cached.blob().then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          // Preload the blob URL for instant access
          preloadImageWithLink(blobUrl);
          resolve();
        }).catch(() => {
          // Fallback to normal preload
          preloadImageWithLink(src);
        });
      } else {
        // Not cached - use normal preload and cache it
        preloadImageWithLink(src);
        
        // Cache for future use (non-blocking)
        cacheImage(src).catch(() => {});
      }
    }).catch(() => {
      // Cache API not available - use normal preload
      preloadImageWithLink(src);
    });

    // Also use Image object for immediate loading
    const img = new Image();
    
    img.onload = () => {
      // Cache the loaded image for future use
      cacheImage(src).catch(() => {});
      resolve();
    };
    
    img.onerror = () => {
      // Even if image fails, resolve to not block the flow
      resolve();
    };

    // Set crossOrigin for external images if needed
    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    // Start loading immediately with high priority (if supported)
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel with maximum priority
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  // Filter out duplicates and invalid URLs
  const uniqueUrls = Array.from(new Set(urls.filter(url => url && url.trim() !== '' && !url.startsWith('data:'))));
  
  if (uniqueUrls.length === 0) {
    return;
  }

  // First, add all link preload tags immediately (synchronous, fastest)
  uniqueUrls.forEach(url => preloadImageWithLink(url));

  // Then preload using Image objects in parallel
  // Use requestIdleCallback if available for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Promise.all(uniqueUrls.map(url => preloadImage(url))).catch(() => {});
    }, { timeout: 100 });
  } else {
    // Fallback: load immediately
    Promise.all(uniqueUrls.map(url => preloadImage(url))).catch(() => {});
  }
};

/**
 * Preload club images from club data - ULTRA FAST with persistent caching
 */
export const preloadClubImages = (clubs: any[]): void => {
  if (!clubs || clubs.length === 0) return;

  // Extract all image URLs (could be Cloudinary URLs or local paths)
  const imageUrls = clubs
    .map(club => club.image_url)
    .filter(url => url && url.trim() !== '');

  // Preload immediately using link tags (synchronous, instant)
  // This works for both Cloudinary URLs and local paths
  imageUrls.forEach(url => {
    // Optimize Cloudinary URLs if needed
    const optimizedUrl = url.includes('cloudinary.com') ? optimizeCloudinaryUrl(url) : url;
    
    // Check cache first for instant loading
    getCachedImage(optimizedUrl).then((cached) => {
      if (cached) {
        // Use cached version - create blob URL for instant access
        cached.blob().then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          preloadImageWithLink(blobUrl);
        }).catch(() => {
          preloadImageWithLink(optimizedUrl);
        });
      } else {
        // Not cached - preload and cache for future
        preloadImageWithLink(optimizedUrl);
        cacheImage(optimizedUrl).catch(() => {});
      }
    }).catch(() => {
      preloadImageWithLink(optimizedUrl);
      cacheImage(optimizedUrl).catch(() => {});
    });
    
    // For Cloudinary URLs, add fetchpriority and preload immediately
    if (optimizedUrl.startsWith('http://') || optimizedUrl.startsWith('https://')) {
      // Also create Image object for immediate loading
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.crossOrigin = 'anonymous';
      img.src = optimizedUrl;
      img.onload = () => {
        // Cache after successful load
        cacheImage(optimizedUrl).catch(() => {});
      };
    } else {
      // Local path - use existing preload logic
      const img = new Image();
      img.src = optimizedUrl;
      img.onload = () => {
        cacheImage(optimizedUrl).catch(() => {});
      };
    }
  });

  // Also preload with Image objects for maximum compatibility
  preloadImages(imageUrls).catch(() => {});
};

/**
 * Optimize Cloudinary URL with transformation parameters
 * Forces WebP format for maximum compression and speed
 */
function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Skip if already optimized
  if (url.includes('/f_webp,') || url.includes('/f_webp/')) {
    return url;
  }

  // Replace f_auto with f_webp if present
  if (url.includes('/f_auto,')) {
    return url.replace('/f_auto,', '/f_webp,');
  }
  if (url.includes('/f_auto/')) {
    return url.replace('/f_auto/', '/f_webp/');
  }

  // Add optimization parameters: f_webp (force WebP format), q_auto:low (faster loading), w_600 (smaller width)
  // f_webp provides 30-50% better compression than PNG/JPG
  // w_600 and q_auto:low reduce file size further for faster loading
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/${parts[1]}`;
    }
  }
  
  return url;
}

/**
 * Preload auth page images for instant loading on login/signup pages
 * Includes persistent caching for instant loading on refresh/logout
 */
export const preloadAuthImages = (): void => {
  const authImages = [
    '/image-1.webp',           // SignUp page
    '/image-2.webp',          // SignIn page
    '/forget-pass.webp',      // ForgotPassword page
    '/ladki - Edited.png',    // ResetPasswordEmail page
    '/logo.png',              // Logo (used on all auth pages)
    '/image.png',             // Email icon
    '/sign-up.png'            // Button icon
  ];

  if (typeof window !== 'undefined' && document.head) {
    authImages.forEach(img => {
      // Check cache first
      getCachedImage(img).then((cached) => {
        if (cached) {
          // Use cached version
          cached.blob().then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            preloadImageWithLink(blobUrl);
          }).catch(() => {
            preloadImageWithLink(img);
          });
        } else {
          preloadImageWithLink(img);
          cacheImage(img).catch(() => {});
        }
      }).catch(() => {
        preloadImageWithLink(img);
        cacheImage(img).catch(() => {});
      });
      
      // Also create Image object for immediate browser cache
      const imgObj = new Image();
      if ('fetchPriority' in imgObj) {
        (imgObj as any).fetchPriority = 'high';
      }
      imgObj.src = img;
      imgObj.onload = () => {
        // Cache after successful load
        cacheImage(img).catch(() => {});
      };
    });
  }
};

/**
 * Preload common club images immediately on app start
 * Now includes optimized Cloudinary URLs for instant loading
 * Includes persistent caching for instant loading on refresh/logout
 */
export const preloadCommonClubImages = (): void => {
  // Cloudinary URLs from the uploaded images (optimized with WebP format and smaller dimensions)
  // f_webp forces WebP format for 30-50% better compression than PNG/JPG
  // w_600: smaller width for faster loading (still high quality)
  // q_auto:low: faster loading with acceptable quality
  const cloudinaryUrls = [
    // Removed card-img.png from Cloudinary due to URL failure - using local fallback
    // 'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801943/fitfare/clubs/card-img.png',
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
    'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801964/fitfare/clubs/gym-11.jpg'
  ];

  // Fallback local paths (in case Cloudinary is not available)
  const localImages = [
    '/card-img.png',
    '/gym-1.jfif',
    '/gym-2.jfif',
    '/gym-3.jfif',
    '/gym-4.jfif',
    '/gym-5.jfif',
    '/gym-6.jfif',
    '/gym-7.jfif',
    '/gym-8.jfif',
    '/gym-9.jfif',
    '/gym-10.jfif',
    '/gym-11.jfif'
  ];

  // Preload immediately on page load - prioritize Cloudinary URLs
  if (typeof window !== 'undefined' && document.head) {
    // Preload Cloudinary URLs first (CDN is faster) - optimized versions
    cloudinaryUrls.forEach(url => {
      // Check cache first for instant loading
      getCachedImage(url).then((cached) => {
        if (cached) {
          // Use cached version
          cached.blob().then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            preloadImageWithLink(blobUrl);
          }).catch(() => {
            preloadImageWithLink(url);
          });
        } else {
          // Preload with link tag (highest priority)
          preloadImageWithLink(url);
          // Cache for future use
          cacheImage(url).catch(() => {});
        }
      }).catch(() => {
        preloadImageWithLink(url);
        cacheImage(url).catch(() => {});
      });
      
      // Also create Image object for immediate browser cache
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.crossOrigin = 'anonymous';
      // Start loading immediately
      img.src = url;
      img.onload = () => {
        // Cache after successful load
        cacheImage(url).catch(() => {});
      };
    });
    
    // Also preload local paths as fallback
    localImages.forEach(img => {
      getCachedImage(img).then((cached) => {
        if (!cached) {
          preloadImageWithLink(img);
          cacheImage(img).catch(() => {});
        }
      }).catch(() => {
        preloadImageWithLink(img);
        cacheImage(img).catch(() => {});
      });
    });
  }
};

/**
 * Preload images with priority (for above-the-fold content)
 */
export const preloadPriorityImages = async (urls: string[]): Promise<void> => {
  // Preload first few images with higher priority
  const priorityUrls = urls.slice(0, 4);
  const remainingUrls = urls.slice(4);

  // Load priority images first
  await preloadImages(priorityUrls);
  
  // Then load remaining images
  if (remainingUrls.length > 0) {
    preloadImages(remainingUrls).catch(() => {});
  }
};

