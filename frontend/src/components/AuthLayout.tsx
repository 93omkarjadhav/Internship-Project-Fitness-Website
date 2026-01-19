import { ReactNode, useEffect, useState } from "react";
import { preloadImage } from "../utils/imagePreloader";
import { ensureImageCached, getCachedImageBlob, isImageCached } from "../utils/syncImageCache";

interface AuthLayoutProps {
  children: ReactNode;
  hideLogo?: boolean;
  hideTitleAndSubtitle?: boolean;
  disableCentering?: boolean;
  leftImageSrc?: string;
}

const AuthLayout = ({ children, hideLogo, hideTitleAndSubtitle, disableCentering, leftImageSrc }: AuthLayoutProps) => {
  const imageSrc = leftImageSrc || "/image-1.webp";
  
  // CRITICAL: Force image into cache IMMEDIATELY (synchronous, before React renders)
  if (typeof window !== 'undefined') {
    // ULTRA-AGGRESSIVE: Create 50 Image objects to force into cache
    for (let i = 0; i < 50; i++) {
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.src = imageSrc; // Force into browser cache immediately
    }
    
    // Also create link preload tag immediately
    const existingLink = document.querySelector(`link[rel="preload"][as="image"][href="${imageSrc}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageSrc;
      if ('fetchPriority' in link) {
        (link as any).fetchPriority = 'high';
      }
      document.head.appendChild(link);
    }
  }
  
  // Check cache synchronously
  const isCached = typeof window !== 'undefined' ? isImageCached(imageSrc) : false;
  ensureImageCached(imageSrc); // Force into cache immediately
  
  // Start with original URL - browser will use cache if available (instant)
  const [imageUrl, setImageUrl] = useState<string>(imageSrc);

  // Check service worker cache for blob URL (fast async check)
  useEffect(() => {
    // Try service worker cache for blob URL (instant display)
    getCachedImageBlob(imageSrc).then(blobUrl => {
      if (blobUrl) {
        setImageUrl(blobUrl); // Use cached blob URL for instant display
      }
    }).catch(() => {});
    
    // Also preload for future use
    preloadImage(imageSrc);
    
    // Force immediate loading with Image object (multiple times for aggressive caching)
    for (let i = 0; i < 50; i++) {
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // CRITICAL: Handle browser back/forward navigation - preload image immediately
  useEffect(() => {
    const handlePopState = () => {
      // Browser back/forward - force image into cache immediately
      for (let i = 0; i < 50; i++) {
        const img = new Image();
        if ('fetchPriority' in img) {
          (img as any).fetchPriority = 'high';
        }
        img.src = imageSrc;
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also handle pageshow (page restored from history)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page restored from cache - ensure image is cached
        for (let i = 0; i < 50; i++) {
          const img = new Image();
          if ('fetchPriority' in img) {
            (img as any).fetchPriority = 'high';
          }
          img.src = imageSrc;
        }
      }
    };
    
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [imageSrc]);

  return (
    <div className="min-h-screen w-full bg-transparent md:bg-gray-50 flex md:items-center md:justify-center p-0 md:p-4 overflow-y-auto">
      <div className="flex w-full max-w-4xl bg-transparent shadow-none rounded-none border-none md:bg-white md:shadow-xl md:rounded-3xl md:overflow-hidden md:min-h-[650px] md:max-h-[90vh]">
        
        {/* LEFT IMAGE - Fixed dimensions to prevent layout shift */}
        <div className={`hidden md:block w-1/2 relative bg-white ${leftImageSrc === "/ladki - Edited.png" || leftImageSrc === "/forgi.jpeg" ? "flex items-center justify-center p-2" : ""}`} style={{ minHeight: '650px' }}>
          {/* Image - Load immediately with no delay, use cached URL if available */}
          <img
            src={imageUrl}
            alt="Fitness background"
            className={`w-full h-full ${leftImageSrc === "/ladki - Edited.png" || leftImageSrc === "/forgi.jpeg" ? "object-contain" : "object-cover"}`}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: leftImageSrc === "/ladki - Edited.png" || leftImageSrc === "/forgi.jpeg" ? 'contain' : 'cover'
            }}
          />
        </div>

        {/* RIGHT FORM */}
        <div className={`w-full md:w-1/2 flex flex-col pt-8 md:pt-10 px-4 md:px-10 pb-4 md:pb-10 overflow-y-auto ${
            !disableCentering ? 'justify-start items-center' : 'justify-start items-start md:justify-center md:items-center'}
          }`}>
          <div className={`w-full max-w-sm ${!disableCentering ? 'mx-auto' : ''}`}>
            
            {!hideLogo && (
              <div className="flex justify-center mb-4 md:mb-2">
                <img 
                  src="/logo.png" 
                  className="w-16 h-16" 
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  alt="FitFare Logo"
                />
              </div>
            )}

            {!hideTitleAndSubtitle && (
              <>
                <h2 className="text-3xl font-semibold text-center mb-3 md:mb-0">FitFare</h2>
                <p className="text-sm text-gray-500 text-center mb-8 md:mb-5">
                  Sign In to access in demand fitness clubs
                </p>
              </>
            )}

            {children}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
