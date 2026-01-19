/**
 * Aggressive Image Preloader
 * Preloads images immediately on page load with maximum priority
 * This runs even before React renders
 */

// Run immediately when script loads (before DOM is ready)
(function aggressiveImagePreloader() {
  if (typeof window === 'undefined') return;
  // Preload critical images immediately
  const criticalImages = [
    // Auth page images
    '/image-1.webp',
    '/image-2.webp',
    '/forget-pass.webp',
    '/logo.png',
    '/image.png',
    '/sign-up.png',
    // Club images from Cloudinary (optimized)
    // Removed card-img.png from Cloudinary due to URL failure - using local fallback
    // 'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801943/fitfare/clubs/card-img.png',
    '/card-img.png',
    'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801945/fitfare/clubs/gym-1.jpg',
    'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801947/fitfare/clubs/gym-2.jpg',
    'https://res.cloudinary.com/dbwflm25l/image/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/v1767801949/fitfare/clubs/gym-3.jpg',
  ];

  // Preload images immediately using Image objects - FORCE into browser cache
  criticalImages.forEach(src => {
    // Create multiple Image objects to force aggressive caching
    for (let i = 0; i < 2; i++) {
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      // Set src immediately to force browser to cache
      img.src = src;
      // Also set onload to ensure it's cached
      img.onload = () => {
        // Image is now in browser cache
      };
    }
  });

  // Also add link preload tags when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        if ('fetchPriority' in link) {
          (link as any).fetchPriority = 'high';
        }
        if (src.startsWith('http')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    });
  } else {
    // DOM already ready, add links immediately
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if ('fetchPriority' in link) {
        (link as any).fetchPriority = 'high';
      }
      if (src.startsWith('http')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }
})();

