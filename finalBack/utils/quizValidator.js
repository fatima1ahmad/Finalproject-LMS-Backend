import Joi from "joi";

const commonQuizFields = {
  lesson_id: Joi.number().integer().min(1).required(),
  title: Joi.string().min(3).max(255).required(),
  max_score: Joi.number().integer().min(1).default(10),
};

const quizMessages = {
  "any.required": "{{#label}} is required",
  "number.base": "{{#label}} must be a number",
  "number.integer": "{{#label}} must be an integer",
  "number.min": "{{#label}} must be at least {{#limit}}",
  "number.max": "{{#label}} must not exceed {{#limit}}",
  "string.min": "{{#label}} must be at least {{#limit}} characters",
  "string.max": "{{#label}} must not exceed {{#limit}} characters",
};

export const quizCreateSchema = Joi.object({
  ...commonQuizFields,
}).messages(quizMessages);

export const quizUpdateSchema = Joi.object({
  lesson_id: Joi.number().integer().min(1),
  title: Joi.string().min(3).max(255),
  max_score: Joi.number().integer().min(1),
})
  .min(1) // At least one field required for update
  .messages(quizMessages);

// Custom validation for quiz operations
export const quizIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
}).messages(quizMessages);

export const lessonIdSchema = Joi.object({
  lesson_id: Joi.number().integer().min(1).required(),
}).messages(quizMessages);
// Add this to quizValidator.js (before the exports)
export const quizSubmissionSchema = Joi.object({
  answers: Joi.object()
    .pattern(
      Joi.number().integer().min(1), // Question IDs as numbers
      Joi.string().min(1).max(500) // Answers as strings
    )
    .required(),
}).messages(quizMessages);
