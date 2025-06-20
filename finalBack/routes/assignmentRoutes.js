import { Router } from "express";
import AssignmentController from "../controllers/assignmentController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// Protected routes
router.use(authenticate);
// Add to assignmentRoutes.js
router.get(
  "/instructor/courses",
  authorize(["instructor"]),
  AssignmentController.getInstructorCoursesWithHierarchy
);
router.get(
  "/instructor/all",
  authorize(["instructor"]),
  AssignmentController.getInstructorAssignments
);

// Instructor/Admin routes
router.post(
  "/",
  authorize(["instructor"]),
  AssignmentController.createAssignment
);
router.get("/:id", AssignmentController.getAssignment);
router.get("/lesson/:lessonId", AssignmentController.getAssignmentsByLesson);
router.put(
  "/:id",
  authorize(["instructor"]),
  AssignmentController.updateAssignment
);
router.delete(
  "/:id",
  authorize(["instructor", "admin"]),
  AssignmentController.deleteAssignment
);
router.get(
  "/course/:courseId",
  authenticate,
  authorize(["student", "instructor", "admin"]),
  AssignmentController.getAssignmentsByCourse
);

export default router;
