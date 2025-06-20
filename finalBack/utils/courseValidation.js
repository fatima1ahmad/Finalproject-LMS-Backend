import Joi from "joi";

// Course creation validation
export const courseSchema = Joi.object({
  title: Joi.string().min(5).max(255).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 2000 characters",
  }),
  thumbnail_url: Joi.string().uri().allow("").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  category_id: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Category ID must be a number",
    "number.min": "Category ID must be at least 1",
  }),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, approved, rejected",
      "string.empty": "Status is required",
    }),
});

export const courseUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(255).messages({
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 255 characters",
  }),
  description: Joi.string().min(10).max(2000).messages({
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot exceed 2000 characters",
  }),
  thumbnail_url: Joi.string().uri().allow("").messages({
    "string.uri": "Thumbnail must be a valid URL",
  }),
  category_id: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Category ID must be a number",
    "number.min": "Category ID must be at least 1",
  }),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .required()
    .messages({
      "any.only": "Status must be one of: pending, approved, rejected",
      "string.empty": "Status is required",
    }),
}).min(1); // At least one field required for update
