import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "fitfare_profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

export default cloudinary.v2;
