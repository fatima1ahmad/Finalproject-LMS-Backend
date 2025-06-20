import express from "express";
import questionController from "../controllers/questionController.js";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// إضافة سؤال جديد (للمعلمين والمشرفين)
router.post(
  "/:quiz_id",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  questionController.createQuestion
);

// الحصول على سؤال
router.get("/:id", authenticateJWT, questionController.getQuestion);

// تحديث سؤال (للمعلمين والمشرفين)
router.put(
  "/:id",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  questionController.updateQuestion
);

// حذف سؤال (للمعلمين والمشرفين)
router.delete(
  "/:id",
  authenticateJWT,
  authorize(["instructor", "admin"]),
  questionController.deleteQuestion
);

// الحصول على جميع أسئلة اختبار معين
router.get(
  "/quiz/:quiz_id",
  authenticateJWT,
  questionController.getQuestionsByQuiz
);

export default router;
