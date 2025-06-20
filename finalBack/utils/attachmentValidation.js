import Joi from "joi";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../config/constants.js";

// Schema for file upload validation
export const uploadFileSchema = Joi.object({
  file: Joi.object({
    originalname: Joi.string().required(),
    mimetype: Joi.string()
      .valid(...ALLOWED_FILE_TYPES)
      .required(),
    size: Joi.number().max(MAX_FILE_SIZE).required(),
    buffer: Joi.binary().required(),
  })
    .required()
    .unknown(true), // ✅ السماح بخصائص إضافية داخل الملف نفسه
}).unknown(true); // (اختياري) السماح بخصائص إضافية خارج `file`

// Schema for ID parameter validation
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(), // Assuming your IDs are UUIDs
});

// Schema for Cloudinary response validation
export const cloudinaryResponseSchema = Joi.object({
  public_id: Joi.string().required(),
  secure_url: Joi.string().uri().required(),
  format: Joi.string().required(),
});

// Schema for attachment DTO validation
export const attachmentDTOSchema = Joi.object({
  original_name: Joi.string().required(),
  mime_type: Joi.string().required(),
  size: Joi.number().required(),
  public_id: Joi.string().required(),
  secure_url: Joi.string().uri().required(),
  format: Joi.string().allow(null, "").optional(), // ✅ هذا هو التعديل المهم
});
