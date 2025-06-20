import Joi from "joi";

const commonQuestionFields = {
  question: Joi.string().min(5).max(1000).required(),
  options: Joi.array()
    .items(Joi.string().min(1).max(255))
    .min(2) // Minimum 2 options
    .required()
    .custom((value, helpers) => {
      // Check for duplicate options
      if (new Set(value).size !== value.length) {
        return helpers.error("array.unique");
      }
      return value;
    }, "Unique Options Validation"),
  correct_answer: Joi.string().required(),
  score: Joi.number().integer().min(1).max(100).default(1),
  order: Joi.number().integer().min(1),
};

const questionMessages = {
  "array.unique": "options must contain unique values",
  "any.required": "{{#label}} is required",
  "array.min": "{{#label}} must contain at least {{#limit}} items",
  "string.min": "{{#label}} must be at least {{#limit}} characters long",
  "string.max": "{{#label}} must be at most {{#limit}} characters long",
  "number.min": "{{#label}} must be at least {{#limit}}",
  "number.max": "{{#label}} must be at most {{#limit}}",
};

export const questionCreateSchema = Joi.object({
  quiz_id: Joi.number().integer().required(),
  ...commonQuestionFields,
}).messages(questionMessages);

export const questionUpdateSchema = Joi.object({
  question: Joi.string().min(5).max(1000),
  options: Joi.array()
    .items(Joi.string().min(1).max(255))
    .min(2) // Minimum 2 options even for updates
    .custom((value, helpers) => {
      if (value && new Set(value).size !== value.length) {
        return helpers.error("array.unique");
      }
      return value;
    }, "Unique Options Validation"),
  correct_answer: Joi.string(),
  score: Joi.number().integer().min(1).max(100),
  order: Joi.number().integer().min(1),
})
  .min(1) // At least one field required for update
  .messages(questionMessages);
