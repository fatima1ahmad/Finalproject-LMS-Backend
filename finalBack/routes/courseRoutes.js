import { Router } from "express";
import CourseController from "../controllers/courseController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, CourseController.getAllCourses);
router.get("/:id", CourseController.getCourseDetails);

// Protected routes
router.use(authenticate);

router.post("/", authorize(["instructor"]), CourseController.createCourse);
router.put("/:id", authorize(["instructor"]), CourseController.updateCourse);
router.delete(
  "/:id",
  authorize(["admin", "instructor"]),
  CourseController.deleteCourse
);
router.patch(
  "/:id/approve",
  authorize(["admin"]),
  CourseController.approveCourse
);
router.patch(
  "/:id/reject",
  authorize(["admin"]),
  CourseController.rejectCourse
);

export default router;
