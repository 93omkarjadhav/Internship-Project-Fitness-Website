/**
 * Image URL Mapper
 * Maps local image paths to Cloudinary CDN URLs for instant loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load mapping from file
let imageMapping = {};
const mappingPath = path.join(__dirname, '../../scripts/imageMapping.json');

try {
  if (fs.existsSync(mappingPath)) {
    const mappingData = fs.readFileSync(mappingPath, 'utf8');
    imageMapping = JSON.parse(mappingData);
    console.log('✅ Loaded Cloudinary image mapping');
  }
} catch (error) {
  console.warn('⚠️  Could not load image mapping, using local paths');
}

/**
 * Optimize Cloudinary URL with transformation parameters for faster loading
 * Forces WebP format for maximum compression and speed
 */
function optimizeCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Skip if already optimized (has transformation parameters)
  if (url.includes('/f_webp,') || url.includes('/f_webp/') || url.includes('/f_auto,')) {
    // If already has f_auto, replace with f_webp for club images
    if (url.includes('/fitfare/clubs/')) {
      return url.replace('/f_auto,', '/f_webp,').replace('/f_auto/', '/f_webp/');
    }
    return url;
  }

  // Add optimization parameters to Cloudinary URL
  // f_webp: Force WebP format (30-50% smaller than PNG/JPG)
  // q_auto:low: lower quality for faster loading (still looks good)
  // w_600: max width 600px (smaller for faster loading, still high quality on mobile/desktop)
  // c_limit: maintain aspect ratio, don't crop
  // dpr_auto: auto device pixel ratio
  
  // Cloudinary URL format: .../upload/[transformations]/v[version]/[folder]/[filename]
  if (url.includes('/upload/')) {
    // Insert transformations after /upload/
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Add optimized transformations: f_webp,q_auto:low,w_600,c_limit,dpr_auto
      // w_600 reduces file size further while maintaining quality
      // q_auto:low provides faster loading with acceptable quality
      return `${parts[0]}/upload/f_webp,q_auto:low,w_600,c_limit,dpr_auto/${parts[1]}`;
    }
  }
  
  return url;
}

/**
 * Get Cloudinary URL for a local image path
 * Falls back to local path if not found in mapping
 * Returns optimized Cloudinary URLs for faster loading
 */
export function getImageUrl(localPath) {
  if (!localPath) {
    return '/card-img.png'; // Default fallback
  }

  // If already a full URL (Cloudinary or external), optimize it
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return optimizeCloudinaryUrl(localPath);
  }

  // Extract filename from path
  const filename = localPath.startsWith('/') ? localPath.substring(1) : localPath;
  
  // Check if we have a Cloudinary URL for this image
  if (imageMapping[filename]) {
    // Return optimized Cloudinary URL
    return optimizeCloudinaryUrl(imageMapping[filename]);
  }

  // Fallback to local path
  return localPath;
}

/**
 * Get all Cloudinary URLs for club images
 */
export function getAllCloudinaryUrls() {
  return Object.values(imageMapping);
}

/**
 * Check if images are hosted on Cloudinary
 */
export function areImagesHosted() {
  return Object.keys(imageMapping).length > 0;
}

