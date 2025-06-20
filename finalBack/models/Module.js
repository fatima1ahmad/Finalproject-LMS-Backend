import { pool } from "../config/db.js";
//this is the module
const ModuleModel = {
  async create({ course_id, title, description, order, duration }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO modules (course_id, title, description, "order", duration)  
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [course_id, title, description, order, duration]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findByCourseId(courseId) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM modules WHERE course_id = $1 ORDER BY "order"`,
        [courseId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  async findById(id) {
    try {
      const { rows } = await pool.query(`SELECT * FROM modules WHERE id = $1`, [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async update(id, { title, description, order, duration }) {
    try {
      const { rows } = await pool.query(
        `UPDATE modules 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             "order" = COALESCE($3, "order"),
             duration = COALESCE($4, duration),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [title, description, order, duration, id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      await pool.query(`DELETE FROM modules WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default ModuleModel;
