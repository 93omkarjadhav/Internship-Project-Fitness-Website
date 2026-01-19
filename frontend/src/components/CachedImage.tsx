/**
 * CachedImage Component
 * Displays images instantly from cache, falls back to network if not cached
 * Ensures images stay visible even after refresh/logout
 */

import { useState, useEffect, ImgHTMLAttributes } from 'react';

interface CachedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const CachedImage = ({ src, alt, fallback, ...props }: CachedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Check Cache API first for instant loading
    const loadFromCache = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('fitfare-images-cache-v1');
          const cached = await cache.match(src);
          
          if (cached) {
            // Image is cached - use blob URL for instant display
            const blob = await cached.blob();
            const blobUrl = URL.createObjectURL(blob);
            setImageSrc(blobUrl);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Cache API failed, continue to normal load
        }
      }
      
      // Not in cache - load normally and cache it
      const img = new Image();
      
      img.onload = async () => {
        // Cache the loaded image for future use
        if ('caches' in window) {
          try {
            const cache = await caches.open('fitfare-images-cache-v1');
            const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
            if (response.ok) {
              await cache.put(src, response.clone());
            }
          } catch (error) {
            // Silently fail caching
          }
        }
        setImageSrc(src);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        // If image fails, try fallback
        if (fallback) {
          setImageSrc(fallback);
        }
        setIsLoading(false);
      };
      
      if (src.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = src;
    };

    loadFromCache();
  }, [src, fallback]);

  if (isLoading && !imageSrc) {
    return (
      <div 
        className={props.className} 
        style={{ 
          backgroundColor: '#f0f0f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...props.style 
        }}
      >
        <div style={{ width: '20px', height: '20px', border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imageSrc || fallback || src}
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      onError={(e) => {
        if (fallback && imageSrc !== fallback) {
          setImageSrc(fallback);
        }
        props.onError?.(e);
      }}
    />
  );
};


