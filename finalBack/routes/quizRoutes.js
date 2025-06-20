import express from "express";
import quizController from "../controllers/quizController.js";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Quiz CRUD operations
router.post(
  "/",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  quizController.createQuiz
);

router.get("/:id", authenticateJWT, quizController.getQuiz);

router.put(
  "/:id",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  quizController.updateQuiz
);

router.delete(
  "/:id",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  quizController.deleteQuiz
);

router.get(
  "/lesson/:lesson_id",
  authenticateJWT,
  quizController.getQuizzesByLesson
);

// Quiz Submission endpoints
router.post(
  "/:id/submit",
  authenticateJWT,
  authorize(["student"]),
  quizController.submitQuiz
);

router.get(
  "/:id/submissions",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  quizController.getQuizSubmissions
);

router.get(
  "/:id/submissions/:submission_id",
  authenticateJWT,
  quizController.getQuizSubmission
);

router.get(
  "/:id/my-submission",
  authenticateJWT,
  authorize(["student"]),
  quizController.getMyQuizSubmission
);

export default router;
