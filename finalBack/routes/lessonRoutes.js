import { Router } from "express";
import LessonController from "../controllers/lessonController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"; // ✅ import multer middleware

const router = Router();

// Public route to get lessons by module
router.get("/module/:moduleId", LessonController.getLessonsByModule);

// Protected routes
router.use(authenticate);
router.post(
  "/",
  authorize(["instructor"]),
  upload.single("file"), // ✅ هنا نضيف multer
  LessonController.createLesson
);

// Instructor/Admin routes
// router.post("/", authorize(["instructor"]), LessonController.createLesson);
router.get("/:id", LessonController.getLesson);
router.put("/:id", authorize(["instructor"]), LessonController.updateLesson);
router.delete(
  "/:id",
  authorize(["instructor", "admin"]),
  LessonController.deleteLesson
);

export default router;
