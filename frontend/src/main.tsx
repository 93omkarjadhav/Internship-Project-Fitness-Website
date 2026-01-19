import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadCommonClubImages, preloadAuthImages } from "./utils/imagePreloader";
import { registerServiceWorker, preCacheImages } from "./utils/registerServiceWorker";

// Register service worker for persistent image caching (works across refreshes/logouts)
registerServiceWorker();

// Pre-cache images using Cache API
preCacheImages();

// Preload ALL auth page images immediately (for instant navigation)
// This ensures images are in cache when navigating between pages
preloadAuthImages();

// ULTRA-AGGRESSIVE: Preload ALL auth images immediately (20x per image for instant cache)
const allAuthImages = [
  '/image-1.webp',  // SignUp
  '/image-2.webp',  // SignIn
  '/forget-pass.webp',  // ForgotPassword
  '/ladki - Edited.png',  // ResetPasswordEmail
  '/logo.png',
  '/image.png',
  '/sign-up.png'
];

// ULTRA-AGGRESSIVE preloading: 20 Image objects per image for instant browser cache
allAuthImages.forEach(src => {
  for (let i = 0; i < 20; i++) {
    const img = new Image();
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = src; // Force into browser cache immediately
    img.onload = () => {
      // Image is now in browser cache
    };
  }
  
  // Also create link preload tag
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
});

// Preload common club images immediately on app start
preloadCommonClubImages();

createRoot(document.getElementById("root")!).render(<App />);
