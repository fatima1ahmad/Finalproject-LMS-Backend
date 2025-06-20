import { pool } from "../config/db.js";

const AssignmentModel = {
  // Create a new assignment and return the created row
  async create({ lesson_id, title, description, max_score }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO assignments 
       (lesson_id, title, description, max_score) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
        [lesson_id, title, description, max_score]
      );
      return rows[0];
    } catch (error) {
      console.error("Error creating assignment:", error);
      throw error;
    }
  },
  //a.*title to show all the col in the databeas
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT a.*, l.title as lesson_title
       FROM assignments a
       JOIN lessons l ON a.lesson_id = l.id
       WHERE a.id = $1`,
      [id]
    );
    return rows[0];
  },

  // Find all assignments for a specific lesson, ordered by creation date
  async findByLessonId(lessonId) {
    const { rows } = await pool.query(
      `SELECT * FROM assignments 
       WHERE lesson_id = $1
       ORDER BY created_at`,
      [lessonId]
    );
    return rows;
  },

  // Update an assignment's fields and return the updated row
  async update(id, updates) {
    const { rows } = await pool.query(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           max_score = COALESCE($3, max_score),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [updates.title, updates.description, updates.max_score, id]
    );
    return rows[0];
  },

  // Delete an assignment by its ID
  async delete(id) {
    await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
    return true;
  },
  // models/AssignmentModel.js
  findManyByLessonIds: async (lessonIds) => {
    if (!lessonIds.length) return [];

    const placeholders = lessonIds.map((_, i) => `$${i + 1}`).join(", ");
    const query = `
    SELECT a.*, l.title as lesson_title, l.module_id
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    WHERE a.lesson_id IN (${placeholders})
  `;
    const { rows } = await pool.query(query, lessonIds);
    return rows;
  },
  // داخل AssignmentModel.js
  findDetailedByLessonIds: async (lessonIds) => {
    if (!lessonIds.length) return [];

    const placeholders = lessonIds.map((_, i) => `$${i + 1}`).join(", ");
    const query = `
    SELECT 
      a.*, 
      l.title AS lesson_title,
      m.title AS module_title,
      c.title AS course_title,
      c.id AS course_id,
      m.id AS module_id
    FROM assignments a
    JOIN lessons l ON a.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE a.lesson_id IN (${placeholders})
  `;

    const { rows } = await pool.query(query, lessonIds);
    return rows;
  },
  async findByCourseId(courseId) {
    const query = `
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.max_score,
        a.created_at,
        a.updated_at,
        l.id as lesson_id,
        l.title as lesson_title,
        l."order" as lesson_order,
        m.id as module_id,
        m.title as module_title,
        m."order" as module_order
      FROM assignments a
      JOIN lessons l ON a.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
      ORDER BY m."order", l."order", a.created_at
    `;
    const { rows } = await pool.query(query, [courseId]);
    return rows;
  },
};

export default AssignmentModel;
