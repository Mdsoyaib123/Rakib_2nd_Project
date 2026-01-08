import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUD_API_KEY!,
  api_secret: process.env.CLOUD_API_SECRET!,
});

export const createUploader = (folder: string) => {
  // console.log("folder", folder);
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    }),
  });

  return multer({ storage });
};



