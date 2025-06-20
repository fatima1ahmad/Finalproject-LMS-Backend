import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.min": "Name must be at least {#limit} characters long",
    "string.max": "Name cannot exceed {#limit} characters",
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .message(
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
    )
    .required(),
    confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Please confirm your password",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .required()
    .invalid(Joi.ref("currentPassword"))
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "string.empty": "New password is required",
      "any.invalid": "New password cannot be the same as current password",
    }), 
    confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Please confirm your new password",
    }),
}).with("newPassword", "confirmPassword");

export const addUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    "string.min": "Name must be at least {#limit} characters long",
    "string.max": "Name cannot exceed {#limit} characters",
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    )
    .message(
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
    )
    .required(),
      role: Joi.string().valid("student", "instructor").required().messages({
    "any.only": "Role must be one of student, instructor",
    "string.empty": "Role is required",
  }),
});
