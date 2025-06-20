import { pool } from "../config/db.js";

const LessonModel = {
  async create({
    module_id,
    title,
    content_type,
    content_url,
    duration,
    order,
  }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO lessons 
         (module_id, title, content_type, content_url, duration, "order") 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [module_id, title, content_type, content_url, duration, order]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM lessons WHERE id = $1`, [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByIdWithDetails(id) {
    try {
      const { rows } = await pool.query(
        `SELECT l.*, m.title as module_title, m.course_id
         FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE l.id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByModuleId(moduleId) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM lessons 
         WHERE module_id = $1
         ORDER BY "order"`,
        [moduleId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { rows } = await pool.query(
        `UPDATE lessons 
         SET title = COALESCE($1, title),
             content_type = COALESCE($2, content_type),
             content_url = COALESCE($3, content_url),
             duration = COALESCE($4, duration),
             "order" = COALESCE($5, "order"),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          updates.title,
          updates.content_type,
          updates.content_url,
          updates.duration,
          updates.order,
          id,
        ]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default LessonModel;
