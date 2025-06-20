import { Router } from "express";
import SubmissionController from "../controllers/submissionController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// Protected routes
router.use(authenticate);

// Student routes
router.post("/", authorize(["student"]), SubmissionController.submitAssignment);
// Shared routes
router.get("/:id", SubmissionController.getSubmission);
router.get(
  "/assignment/:assignmentId",
  SubmissionController.getSubmissionsByAssignment
);

// Instructor/Admin routes
router.put(
  "/:id/grade",
  authorize(["instructor"]),
  SubmissionController.gradeSubmission
);
router.delete(
  "/:id",
  authorize(["student", "instructor", "admin"]),
  SubmissionController.deleteSubmission
);

export default router;
