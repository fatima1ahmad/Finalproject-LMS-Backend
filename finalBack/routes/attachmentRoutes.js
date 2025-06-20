import { Router } from "express";
import multer from "multer";
import {
  deleteFile,
  getFileById,
  uploadFile,
} from "../controllers/attachmentController.js";

const router = Router();
const upload = multer(); // بدون إعدادات يخزن الملف في الذاكرة (buffer)

router.post("/upload", upload.single("file"), uploadFile); // مهم جداً

router.get("/file/:id", getFileById);
router.delete("/file/:id", deleteFile);

export default router;
