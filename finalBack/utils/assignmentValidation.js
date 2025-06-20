import Joi from "joi";
// --- Assignment Validation Schemas ---
export const assignmentCreateSchema = Joi.object({
  lesson_id: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Lesson ID must be a number',
      'number.integer': 'Lesson ID must be an integer',
      'number.min': 'Lesson ID must be at least 1',
      'any.required': 'Lesson ID is required'
    }),
  title: Joi.string().min(3).max(255).required()
    .messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string().allow('').optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  max_score: Joi.number().integer().min(1).default(100)
    .messages({
      'number.base': 'Max score must be a number',
      'number.integer': 'Max score must be an integer',
      'number.min': 'Max score must be at least 1'
    })
});

export const assignmentUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(255)
    .messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 255 characters'
    }),
  description: Joi.string().allow('')
    .messages({
      'string.base': 'Description must be a string'
    }),
  max_score: Joi.number().integer().min(1)
    .messages({
      'number.base': 'Max score must be a number',
      'number.integer': 'Max score must be an integer',
      'number.min': 'Max score must be at least 1'
    })
}).min(1); // At least one field required for update