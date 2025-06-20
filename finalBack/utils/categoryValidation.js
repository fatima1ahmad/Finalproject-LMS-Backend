import Joi from "joi";
//Validation for creating a category
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 3 characters",
    "string.max": "Category name cannot exceed 255 characters",
  }),
});

//Validation for updating a category
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    "string.min": "Category name must be at least 3 characters",
    "string.max": "Category name cannot exceed 255 characters",
  }),
}).min(1); // At least one field required
