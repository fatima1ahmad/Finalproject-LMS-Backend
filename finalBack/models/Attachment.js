// models/Attachment.js
import { pool } from "../config/db.js";

const AttachmentModel = {
  async createAttachment(original_name, mime_type, size, public_id, secure_url, format) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO attachments 
          (original_name, mime_type, size, public_id, secure_url, format)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [original_name, mime_type, size, public_id, secure_url, format]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async   getAttachmentById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM attachments WHERE id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async deleteAttachment(id) {
    try {
      const { rows } = await pool.query(
        `DELETE FROM attachments WHERE id = $1 RETURNING *`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
};

export default AttachmentModel;
