/**
 * Script to upload club images to Cloudinary
 * This will host all club images on Cloudinary CDN for instant loading
 */

import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Club images to upload
const clubImages = [
  'card-img.png',
  'gym-1.jfif',
  'gym-2.jfif',
  'gym-3.jfif',
  'gym-4.jfif',
  'gym-5.jfif',
  'gym-6.jfif',
  'gym-7.jfif',
  'gym-8.jfif',
  'gym-9.jfif',
  'gym-10.jfif',
  'gym-11.jfif',
];

// Path to frontend public folder (from Team-A/backend/scripts to Team-A/frontend/public)
// __dirname is Team-A/backend/scripts, so go up 2 levels to Team-A, then into frontend/public
const publicFolder = path.join(__dirname, '../../frontend/public');

/**
 * Upload a single image to Cloudinary
 */
async function uploadImage(imageName) {
  const imagePath = path.join(publicFolder, imageName);
  
  if (!fs.existsSync(imagePath)) {
    console.warn(`⚠️  Image not found: ${imageName}`);
    return null;
  }

  try {
    console.log(`📤 Uploading ${imageName}...`);
    
    const result = await cloudinary.v2.uploader.upload(imagePath, {
      folder: 'fitfare/clubs',
      public_id: imageName.replace(/\.[^/.]+$/, ''), // Remove extension
      overwrite: true,
      resource_type: 'image',
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
        }
      ]
    });

    console.log(`✅ Uploaded: ${imageName} -> ${result.secure_url}`);
    return {
      local: imageName,
      cloudinary: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error(`❌ Error uploading ${imageName}:`, error.message);
    return null;
  }
}

/**
 * Upload all club images
 */
async function uploadAllImages() {
  console.log('🚀 Starting image upload to Cloudinary...\n');
  
  const results = [];
  
  for (const imageName of clubImages) {
    const result = await uploadImage(imageName);
    if (result) {
      results.push(result);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${results.length}/${clubImages.length} images\n`);

  // Generate mapping file
  const mapping = {};
  results.forEach(result => {
    mapping[result.local] = result.cloudinary;
  });

  // Save mapping to file
  const mappingPath = path.join(__dirname, 'imageMapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`💾 Image mapping saved to: ${mappingPath}\n`);

  // Display mapping
  console.log('📋 Image URL Mapping:');
  console.log('='.repeat(60));
  results.forEach(result => {
    console.log(`${result.local.padEnd(20)} -> ${result.cloudinary}`);
  });
  console.log('='.repeat(60));

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes('uploadClubImages')) {
  // Check Cloudinary configuration first
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary credentials not found in .env file!');
    console.error('Please add the following to your .env file:');
    console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('CLOUDINARY_API_KEY=your_api_key');
    console.error('CLOUDINARY_API_SECRET=your_api_secret');
    process.exit(1);
  }

  console.log('✅ Cloudinary credentials found');
  console.log(`   Cloud Name: ${cloudName}`);
  console.log(`   API Key: ${apiKey.substring(0, 4)}...`);
  console.log('');

  uploadAllImages()
    .then(() => {
      console.log('\n✨ All done! Images are now hosted on Cloudinary CDN.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    });
}

export { uploadAllImages, uploadImage };

