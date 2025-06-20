import multer from "multer";
import AttachmentModel from "../models/Attachment.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import {
  uploadFileSchema,
  idParamSchema,
  attachmentDTOSchema,
  cloudinaryResponseSchema, // ✅ أضفناه هنا
} from "../utils/attachmentValidation.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { error } = uploadFileSchema.validate({ file: req.file });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: "auto", // صححت هنا
    });

    const { error: cloudinaryError } =
      cloudinaryResponseSchema.validate(result);
    if (!result.public_id || !result.secure_url) {
      return res
        .status(500)
        .json({ message: "Cloudinary response missing fields", result });
    }

    const attachmentDTO = {
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format || null, // صححت هنا
    };

    const { error: dtoError } = attachmentDTOSchema.validate(attachmentDTO);
    if (dtoError) {
      return res.status(500).json({ message: "Invalid attachment data" });
    }

    const newAttachment = await AttachmentModel.createAttachment(
      attachmentDTO.original_name,
      attachmentDTO.mime_type,
      attachmentDTO.size,
      attachmentDTO.public_id,
      attachmentDTO.secure_url,
      attachmentDTO.format
    );

    res.status(201).json({
      attachment: newAttachment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
};

// export const uploadFile = async (req, res) => {
//   try {
//     const { error } = uploadFileSchema.validate({ file: req.file });
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const result = await uploadToCloudinary(req.file.buffer, {
//       resource_type: "auto",
//     });

//     const { error: cloudinaryError } =
//       cloudinaryResponseSchema.validate(result);
//     if (cloudinaryError) {
//       return res.status(500).json({ message: "Invalid Cloudinary response" });
//     }

//     const attachmentDTO = {
//       original_name: req.file.originalname,
//       mime_type: req.file.mimetype,
//       size: req.file.size,
//       public_id: result.public_id,
//       secure_url: result.secure_url,
//       format: result.format,
//     };

//     const { error: dtoError } = attachmentDTOSchema.validate(attachmentDTO);
//     if (dtoError) {
//       return res.status(500).json({ message: "Invalid attachment data" });
//     }

//     const newAttachment = await AttachmentModel.createAttachment(
//       attachmentDTO.original_name,
//       attachmentDTO.mime_type,
//       attachmentDTO.size,
//       attachmentDTO.public_id,
//       attachmentDTO.secure_url,
//       attachmentDTO.format
//     );
//     res.status(201).json({
//       attachment: newAttachment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error uploading file",
//       error: error.message,
//     });
//   }
// };

export const getFileById = async (req, res) => {
  try {
    const { error } = idParamSchema.validate({ id: req.params.id });
    if (error) {
      return res.status(400).json({ message: "Invalid attachment ID" });
    }

    const id = req.params.id;
    const attachment = await AttachmentModel.getAttachmentById(id);

    if (!attachment)
      res.status(404).json({
        message: "Attachment not found",
      });
    res.json(attachment);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { error } = idParamSchema.validate({ id: req.params.id });
    if (error) {
      return res.status(400).json({ message: "Invalid attachment ID" });
    }

    const id = req.params.id;
    const attachment = await AttachmentModel.deleteAttachment(id);
    if (!attachment)
      res.status(404).json({
        message: "Attachment not found",
      });
    res.json(attachment);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
