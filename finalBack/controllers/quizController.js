import Quiz from "../models/Quiz.js";
import { createResponse } from "../utils/helpers.js";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware.js";
import {
  quizCreateSchema,
  quizUpdateSchema,
  quizSubmissionSchema,
} from "../utils/quizValidator.js";

export default {
  // Quiz CRUD operations
  createQuiz: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { error, value } = quizCreateSchema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
          });
        }

        const quiz = await Quiz.create(
          value.lesson_id,
          value.title,
          value.max_score
        );

        return res
          .status(201)
          .json(createResponse(true, "Quiz created successfully", quiz));
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  getQuiz: async (req, res) => {
    try {
      const { id } = req.params;
      const quiz = await Quiz.findById(id);

      if (!quiz) {
        return res.status(404).json(createResponse(false, "Quiz not found"));
      }

      return res.json(
        createResponse(true, "Quiz retrieved successfully", quiz)
      );
    } catch (error) {
      return res.status(500).json(createResponse(false, error.message));
    }
  },

  updateQuiz: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { error, value } = quizUpdateSchema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
          });
        }

        const { id } = req.params;
        const quiz = await Quiz.update(id, value);

        if (!quiz) {
          return res.status(404).json(createResponse(false, "Quiz not found"));
        }

        return res.json(
          createResponse(true, "Quiz updated successfully", quiz)
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  deleteQuiz: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const quiz = await Quiz.delete(id);

        if (!quiz) {
          return res.status(404).json(createResponse(false, "Quiz not found"));
        }

        return res.json(
          createResponse(true, "Quiz deleted successfully", quiz)
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  getQuizzesByLesson: async (req, res) => {
    try {
      const { lesson_id } = req.params;
      const quizzes = await Quiz.findByLessonId(lesson_id);

      return res.json(
        createResponse(true, "Quizzes retrieved successfully", quizzes)
      );
    } catch (error) {
      return res.status(500).json(createResponse(false, error.message));
    }
  },

  // Quiz Submission operations
  submitQuiz: [
    authenticateJWT,
    authorize(["student"]),
    async (req, res) => {
      try {
        const { error, value } = quizSubmissionSchema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
          });
        }

        const { id } = req.params;
        const { answers } = value;
        const user_id = req.user.id;

        // Check if user already submitted
        const existingSubmission = await Quiz.getUserSubmission(id, user_id);
        if (existingSubmission) {
          return res
            .status(400)
            .json(
              createResponse(false, "You have already submitted this quiz")
            );
        }

        // Validate all questions exist
        const questions = await Quiz.findQuestionsByQuizId(id);
        const questionIds = questions.map((q) => q.id);
        const answerQuestionIds = Object.keys(answers).map(Number);

        // Check if all answers correspond to actual questions
        const invalidQuestions = answerQuestionIds.filter(
          (qId) => !questionIds.includes(qId)
        );

        if (invalidQuestions.length > 0) {
          return res
            .status(400)
            .json(
              createResponse(
                false,
                `Invalid question IDs: ${invalidQuestions.join(", ")}`
              )
            );
        }

        const submission = await Quiz.createSubmission(id, user_id, answers);

        return res.status(201).json(
          createResponse(true, "Quiz submitted successfully", {
            ...submission,
            quiz_max_score: await Quiz.getQuizMaxScore(id),
          })
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  getQuizSubmissions: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const submissions = await Quiz.getQuizSubmissions(id);
        const maxScore = await Quiz.getQuizMaxScore(id);

        return res.json(
          createResponse(true, "Submissions retrieved successfully", {
            submissions,
            max_score: maxScore,
          })
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  getQuizSubmission: [
    authenticateJWT,
    async (req, res) => {
      try {
        const { submission_id } = req.params;
        const submission = await Quiz.getSubmissionById(submission_id);

        if (!submission) {
          return res
            .status(404)
            .json(createResponse(false, "Submission not found"));
        }

        // Check if user is authorized (owner, instructor, or admin)
        if (
          submission.user_id !== req.user.id &&
          !req.user.roles.includes("instructor") &&
          !req.user.roles.includes("admin")
        ) {
          return res
            .status(403)
            .json(
              createResponse(false, "Unauthorized to view this submission")
            );
        }

        return res.json(
          createResponse(true, "Submission retrieved successfully", {
            ...submission,
            max_score: await Quiz.getQuizMaxScore(submission.quiz_id),
          })
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],

  getMyQuizSubmission: [
    authenticateJWT,
    authorize(["student"]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const user_id = req.user.id;
        const submission = await Quiz.getUserSubmission(id, user_id);

        if (!submission) {
          return res
            .status(404)
            .json(createResponse(false, "You haven't submitted this quiz yet"));
        }

        return res.json(
          createResponse(true, "Submission retrieved successfully", {
            ...submission,
            max_score: await Quiz.getQuizMaxScore(id),
          })
        );
      } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
      }
    },
  ],
};
