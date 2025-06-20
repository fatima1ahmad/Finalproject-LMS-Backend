import Joi from "joi";

// Validation for creating a module
export const createModuleSchema = Joi.object({
  course_id: Joi.number().integer().min(1).required().messages({
    "number.base": "Course ID must be a number",
    "number.integer": "Course ID must be an integer",
    "number.min": "Course ID must be at least 1",
    "any.required": "Course ID is required",
  }),
  title: Joi.string().min(3).max(255).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().max(1000).allow("").messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 1000 characters",
  }),
  order: Joi.number().integer().min(0).required().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 0",
    "any.required": "Order is required",
  }),
  duration: Joi.number().integer().min(1).required().messages({
  "number.base": "Duration must be a number",
  "number.integer": "Duration must be an integer",
  "number.min": "Duration must be at least 1",
  "any.required": "Duration is required",
}),
});

// Validation for updating a module
export const updateModuleSchema = Joi.object({
  title: Joi.string().min(3).max(255).messages({
    "string.base": "Title must be a string",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().allow("").max(1000).messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 1000 characters",
  }),
  order: Joi.number().integer().min(0).messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 0",
  }),
  duration: Joi.number().integer().min(1).required().messages({
  "number.base": "Duration must be a number",
  "number.integer": "Duration must be an integer",
  "number.min": "Duration must be at least 1",
}),
}).min(1); // At least one field required for update