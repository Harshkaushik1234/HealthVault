const cloudinary = require('cloudinary').v2;

// Check if credentials are set
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret';

if (!isCloudinaryConfigured) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: Cloudinary is NOT fully configured in backend/.env. Medical record uploads will return errors until configured.');
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Cloudinary config detected. Direct uploads are ready.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = { cloudinary, isCloudinaryConfigured };
