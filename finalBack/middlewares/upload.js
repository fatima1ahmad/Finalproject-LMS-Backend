// middlewares/upload.js
import multer from "multer";

// تخزين بالذاكرة لاستخدامه مع Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
