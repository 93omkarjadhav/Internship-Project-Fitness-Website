/**
 * RouteImagePreloader Component
 * Preloads images when navigating to auth pages for instant display
 * Also preloads on link hover for even faster loading
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadImage } from '../utils/imagePreloader';

// Map routes to their required images
const routeImageMap: Record<string, string[]> = {
  '/': ['/image-2.webp', '/logo.png', '/image.png', '/sign-up.png'],
  '/signup': ['/image-1.webp', '/logo.png', '/image.png', '/sign-up.png'],
  '/privacy-policy': ['/logo.png', '/image-1.webp', '/image.png', '/sign-up.png'], // Preload logo and signup images
  '/forgot-password': ['/forget-pass.webp', '/logo.png'],
  '/reset-password-email': ['/ladki - Edited.png', '/logo.png'],
  '/forgot-password-sms': ['/forget-pass.webp', '/logo.png'],
};

// Aggressive preload function - ULTRA FAST
const aggressivePreload = (imageSrc: string, multiplier: number = 20) => {
  // Create MANY Image objects for ultra-aggressive caching
  for (let i = 0; i < multiplier; i++) {
    const img = new Image();
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    // Set src immediately to force into browser cache
    img.src = imageSrc;
    // Also set onload to ensure it's cached
    img.onload = () => {
      // Image is now in browser cache
    };
  }
  
  // Also create link preload tag
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
  
  // Preload using utility
  preloadImage(imageSrc);
};

// Preload ALL auth images immediately on module load (before React)
const allAuthImages = [
  '/image-1.webp',  // SignUp
  '/image-2.webp',  // SignIn
  '/forget-pass.webp',  // ForgotPassword
  '/ladki - Edited.png',  // ResetPasswordEmail
  '/logo.png',
  '/image.png',
  '/sign-up.png'
];

// Preload ALL auth images immediately (runs when module loads)
if (typeof window !== 'undefined') {
  allAuthImages.forEach(imageSrc => {
    aggressivePreload(imageSrc);
  });
}

const RouteImagePreloader = () => {
  const location = useLocation();

  // CRITICAL: Handle browser back/forward navigation (popstate event)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Browser back/forward button pressed - preload images for current route
      const pathname = window.location.pathname;
      const imagesToPreload = routeImageMap[pathname] || [];
      
      // ULTRA-AGGRESSIVE preload for browser navigation
      imagesToPreload.forEach(imageSrc => {
        // Create 20 Image objects for instant cache
        for (let i = 0; i < 20; i++) {
          const img = new Image();
          if ('fetchPriority' in img) {
            (img as any).fetchPriority = 'high';
          }
          img.src = imageSrc;
        }
        aggressivePreload(imageSrc);
      });
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    // Also preload on pageshow (when page is restored from history)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from cache - preload images immediately
        const pathname = window.location.pathname;
        const imagesToPreload = routeImageMap[pathname] || [];
        imagesToPreload.forEach(imageSrc => {
          aggressivePreload(imageSrc);
        });
      }
    };
    
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Preload images immediately when route changes (runs synchronously)
  useEffect(() => {
    const pathname = location.pathname;
    const imagesToPreload = routeImageMap[pathname] || [];

    if (imagesToPreload.length > 0) {
      // ULTRA-AGGRESSIVE preload - 50 Image objects per image for instant cache
      imagesToPreload.forEach(imageSrc => {
        // Create 50 Image objects to force into cache immediately
        for (let i = 0; i < 50; i++) {
          const img = new Image();
          if ('fetchPriority' in img) {
            (img as any).fetchPriority = 'high';
          }
          img.src = imageSrc;
        }
        aggressivePreload(imageSrc, 20);
      });
    }
  }, [location.pathname]);

  // CRITICAL: Intercept navigation clicks to preload BEFORE route change
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find the closest link or button
      const link = target.closest('a, button, [onClick], [role="button"]');
      if (!link) return;
      
      // Get href or determine route from text
      const href = (link as HTMLAnchorElement).href || '';
      const pathname = href ? new URL(href, window.location.origin).pathname : '';
      const text = target.textContent?.toLowerCase() || '';
      
      // Determine target route
      let targetRoute = pathname;
      if (!targetRoute || targetRoute === window.location.pathname) {
        if (text.includes('sign up') || text.includes('signup') || text.includes("don't have")) {
          targetRoute = '/signup';
        } else if (text.includes('sign in') || text.includes('signin') || text.includes('already have')) {
          targetRoute = '/';
        } else if (text.includes('forgot password')) {
          targetRoute = '/forgot-password';
        } else if (text.includes('terms') || text.includes('conditions') || text.includes('privacy')) {
          targetRoute = '/privacy-policy';
        }
      }
      
      // If we found a target route, preload images IMMEDIATELY (before navigation)
      if (targetRoute && targetRoute !== window.location.pathname) {
        const imagesToPreload = routeImageMap[targetRoute] || [];
        
        // ULTRA-AGGRESSIVE preload - 50 Image objects per image for instant cache
        imagesToPreload.forEach(imageSrc => {
          // Create 50 Image objects to force into cache immediately
          for (let i = 0; i < 50; i++) {
            const img = new Image();
            if ('fetchPriority' in img) {
              (img as any).fetchPriority = 'high';
            }
            img.src = imageSrc;
          }
          
          // Also create link preload immediately
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
          
          aggressivePreload(imageSrc);
        });
      }
    };

    // CRITICAL: Intercept clicks at the earliest possible moment
    // Use capture phase to catch clicks before they propagate
    document.addEventListener('click', handleClick, { capture: true, passive: true });
    document.addEventListener('mousedown', handleClick, { capture: true, passive: true });
    document.addEventListener('touchstart', handleClick, { capture: true, passive: true });
    
    // Also preload on hover (even earlier)
    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a, button, [onClick], [role="button"]');
      if (link) {
        const text = target.textContent?.toLowerCase() || '';
        const href = (link as HTMLAnchorElement).href || '';
        const pathname = href ? new URL(href, window.location.origin).pathname : '';
        
        let targetRoute = pathname;
        if (!targetRoute) {
          if (text.includes('sign up') || text.includes('signup') || text.includes("don't have")) {
            targetRoute = '/signup';
          } else if (text.includes('sign in') || text.includes('signin') || text.includes('already have')) {
            targetRoute = '/';
          } else if (text.includes('forgot password')) {
            targetRoute = '/forgot-password';
          } else if (text.includes('terms') || text.includes('conditions') || text.includes('privacy')) {
            targetRoute = '/privacy-policy';
          }
        }
        
        const imagesToPreload = routeImageMap[targetRoute] || [];
        imagesToPreload.forEach(imageSrc => {
          // Preload on hover with 30 Image objects
          for (let i = 0; i < 30; i++) {
            const img = new Image();
            if ('fetchPriority' in img) {
              (img as any).fetchPriority = 'high';
            }
            img.src = imageSrc;
          }
          aggressivePreload(imageSrc);
        });
      }
    };

    document.addEventListener('mouseover', handleLinkHover, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      document.removeEventListener('mousedown', handleClick, { capture: true });
      document.removeEventListener('touchstart', handleClick, { capture: true });
      document.removeEventListener('mouseover', handleLinkHover);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RouteImagePreloader;

