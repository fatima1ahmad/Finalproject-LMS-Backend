import Question from "../models/Question.js";
import { createResponse } from "../utils/helpers.js";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware.js";
import {
  questionCreateSchema,
  questionUpdateSchema,
} from "../utils/questionValidator.js";

export default {
  // Create new question
  createQuestion: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { quiz_id } = req.params;

        // Validate request body
        const { error, value } = questionCreateSchema.validate({
          ...req.body,
          quiz_id: Number(quiz_id),
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
          });
        }

        // Additional manual validation
        if (!value.options.includes(value.correct_answer)) {
          return res.status(400).json({
            success: false,
            message: "correct_answer must be one of the options",
          });
        }

        const newQuestion = await Question.create(quiz_id, value);

        return res
          .status(201)
          .json(
            createResponse(true, "Question created successfully", newQuestion)
          );
      } catch (error) {
        return res
          .status(error.status || 500)
          .json(createResponse(false, error.message));
      }
    },
  ],

  // Get question
  getQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      const question = await Question.findById(id);

      if (!question) {
        return res
          .status(404)
          .json(createResponse(false, "Question not found"));
      }

      return res.json(
        createResponse(true, "Question retrieved successfully", question)
      );
    } catch (error) {
      return res
        .status(error.status || 500)
        .json(createResponse(false, error.message));
    }
  },

  // Update question
  updateQuestion: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { id } = req.params;

        // Validate request body
        const { error, value } = questionUpdateSchema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message,
          });
        }

        // Additional manual validation
        if (value.options && !value.options.includes(value.correct_answer)) {
          return res.status(400).json({
            success: false,
            message: "correct_answer must be one of the options",
          });
        }

        const updatedQuestion = await Question.update(id, value);

        if (!updatedQuestion) {
          return res
            .status(404)
            .json(createResponse(false, "Question not found"));
        }

        return res.json(
          createResponse(true, "Question updated successfully", updatedQuestion)
        );
      } catch (error) {
        return res
          .status(error.status || 500)
          .json(createResponse(false, error.message));
      }
    },
  ],

  // Delete question
  deleteQuestion: [
    authenticateJWT,
    authorize(["instructor", "admin"]),
    async (req, res) => {
      try {
        const { id } = req.params;
        const question = await Question.delete(id);

        if (!question) {
          return res
            .status(404)
            .json(createResponse(false, "Question not found"));
        }

        return res.json(createResponse(true, "Question deleted successfully"));
      } catch (error) {
        return res
          .status(error.status || 500)
          .json(createResponse(false, error.message));
      }
    },
  ],

  // Get all questions for a specific quiz
  getQuestionsByQuiz: async (req, res) => {
    try {
      const { quiz_id } = req.params;
      const questions = await Question.findByQuizId(quiz_id);

      return res.json(
        createResponse(true, "Questions retrieved successfully", questions)
      );
    } catch (error) {
      return res
        .status(error.status || 500)
        .json(createResponse(false, error.message));
    }
  },
};
