import { Router } from "express";
import LessonController from "../controllers/lessonController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route to get lessons by module
router.get("/module/:moduleId", LessonController.getLessonsByModule);

// Protected routes
router.use(authenticate);

// Instructor/Admin routes
router.post("/", authorize(["instructor"]), LessonController.createLesson);
router.get("/:id", LessonController.getLesson);
router.put("/:id", authorize(["instructor"]), LessonController.updateLesson);
router.delete(
  "/:id",
  authorize(["instructor", "admin"]),
  LessonController.deleteLesson
);

export default router;
