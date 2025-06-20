import Joi from "joi";

// Validation for creating a lesson
export const createLessonSchema = Joi.object({
  module_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Module ID must be a number",
    "number.integer": "Module ID must be an integer",
    "number.min": "Module ID must be at least 1",
    "any.required": "Module ID is required",
  }),
  title: Joi.string().min(3).max(255).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
    "any.required": "Title is required",
  }),
  content_type: Joi.string()
    .valid("video", "text", "quiz", "pdf", "audio", "assignment")
    .required()
    .messages({
      "any.only":
        "Content type must be one of video, text, quiz, pdf, audio, assignment",
      "any.required": "Content type is required",
    }),
  content_url: Joi.string().uri().required().messages({
    "string.uri": "Content URL must be a valid URI",
    "any.required": "Content URL is required",
  }),
  duration: Joi.number().integer().min(1).required().messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.min": "Duration must be at least 1",
    "any.required": "Duration is required",
  }),
  order: Joi.number().integer().min(0).required().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 0",
    "any.required": "Order is required",
  }),
});

// Validation for updating a lesson 
export const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    "string.base": "Title must be a string",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  content_type: Joi.string()
    .valid("video", "text", "quiz", "pdf", "audio", "assignment")
    .messages({
      "any.only":
        "Content type must be one of video, text, quiz, pdf, audio, assignment",
    }),
  content_url: Joi.string().uri().messages({
    "string.uri": "Content URL must be a valid URI",
  }),
  duration: Joi.number().integer().min(1).messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.min": "Duration must be at least 1",
  }),
  order: Joi.number().integer().min(0).messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 0",
  }),
}).min(1); // At least one field required for update