/**
 * Image Preloader Component
 * Aggressively preloads images as soon as component mounts
 */
import { useEffect } from 'react';
import { preloadCommonClubImages, preloadClubImages } from '../utils/imagePreloader';

interface ImagePreloaderProps {
  clubs?: any[];
}

export const ImagePreloader = ({ clubs }: ImagePreloaderProps) => {
  useEffect(() => {
    // Preload common images immediately on mount
    preloadCommonClubImages();

    // If clubs are provided, preload their images too
    if (clubs && clubs.length > 0) {
      preloadClubImages(clubs);
    }
  }, [clubs]);

  return null; // This component doesn't render anything
};

export default ImagePreloader;


