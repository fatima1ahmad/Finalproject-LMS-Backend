import { pool } from "../config/db.js";

const CourseModel = {
  async create({
    title,
    description,
    instructor_id,
    category_id,
    thumbnail_url = null,
    duration,
  }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO courses 
         (title, description, instructor_id, category_id, thumbnail_url, duration) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          title,
          description,
          instructor_id,
          category_id,
          thumbnail_url,
          duration,
        ]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT c.*, u.name as instructor_name 
         FROM courses c
         JOIN users u ON c.instructor_id = u.id
         WHERE c.id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async findAll() {
    try {
      const { rows } = await pool.query(
        `SELECT c.*, u.name as instructor_name 
         FROM courses c
         JOIN users u ON c.instructor_id = u.id`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  //find by status
  async findByStatus(status) {
    try {
      const { rows } = await pool.query(
        `SELECT c.*, u.name as instructor_name 
         FROM courses c
         JOIN users u ON c.instructor_id = u.id
         WHERE c.status = $1`,
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  async findByInstructor(instructorId) {
    try {
      const { rows } = await pool.query(
        `
      SELECT 
        c.*, 
        u.name as instructor_name,
        COUNT(e.id) AS enrollments_count
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.instructor_id = $1
      GROUP BY c.id, u.name
      `,
        [instructorId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  async findAllByCourseIds(courseIds) {
    if (!courseIds.length) return [];

    const placeholders = courseIds.map((_, idx) => `$${idx + 1}`).join(", ");
    const query = `
      SELECT 
        e.id,
        e.student_id,
        e.course_id,
        e.status,
        e.created_at AS enrollmentDate,
        s.name AS studentName,
        c.title AS courseTitle
      FROM enrollments e
      JOIN users s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.course_id IN (${placeholders})
    `;

    const { rows } = await db.query(query, courseIds);
    return rows;
  },
  async update(id, updates) {
    const {
      title,
      description,
      category_id,
      thumbnail_url,
      duration,
      status,
      feedback,
    } = updates;
    try {
      const { rows } = await pool.query(
        `UPDATE courses 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             category_id = COALESCE($3, category_id),
             thumbnail_url = COALESCE($4, thumbnail_url),
             duration = COALESCE($5, duration),
             status = COALESCE($6, status),
             feedback = COALESCE($7, feedback),
             updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          title,
          description,
          category_id,
          thumbnail_url,
          duration,
          status,
          feedback,
          id,
        ]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // async delete(id) {
  //   try {
  //     await pool.query("DELETE FROM courses WHERE id = $1", [id]);
  //     return true;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. حذف lesson_completions
      await client.query(
        `
      DELETE FROM lesson_completions 
      WHERE lesson_id IN (
        SELECT id FROM lessons 
        WHERE module_id IN (
          SELECT id FROM modules WHERE course_id = $1
        )
      )
    `,
        [id]
      );

      // 2. حذف submissions
      await client.query(
        `
      DELETE FROM submissions 
      WHERE assignment_id IN (
        SELECT id FROM assignments 
        WHERE lesson_id IN (
          SELECT id FROM lessons 
          WHERE module_id IN (
            SELECT id FROM modules WHERE course_id = $1
          )
        )
      )
    `,
        [id]
      );

      // 3. حذف assignments
      await client.query(
        `
      DELETE FROM assignments 
      WHERE lesson_id IN (
        SELECT id FROM lessons 
        WHERE module_id IN (
          SELECT id FROM modules WHERE course_id = $1
        )
      )
    `,
        [id]
      );

      // 4. حذف quizzes
      await client.query(
        `
      DELETE FROM quizzes 
      WHERE lesson_id IN (
        SELECT id FROM lessons 
        WHERE module_id IN (
          SELECT id FROM modules WHERE course_id = $1
        )
      )
    `,
        [id]
      );

      // 5. حذف lessons
      await client.query(
        `
      DELETE FROM lessons 
      WHERE module_id IN (
        SELECT id FROM modules WHERE course_id = $1
      )
    `,
        [id]
      );

      // 6. حذف modules
      await client.query(`DELETE FROM modules WHERE course_id = $1`, [id]);

      // 7. حذف enrollments
      await client.query(`DELETE FROM enrollments WHERE course_id = $1`, [id]);

      // 8. حذف الكورس نفسه
      await client.query(`DELETE FROM courses WHERE id = $1`, [id]);

      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
  async updateStatus(id, status, feedback = null) {
    try {
      const { rows } = await pool.query(
        `UPDATE courses
         SET status = $2,
             feedback = $3,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, status, feedback]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  async getPopularityReport() {
    try {
      const result = await pool.query(
        `
      SELECT 
        c.title as label,
        COUNT(e.id) as enrollments
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.status = 'approved'
      GROUP BY c.id
      ORDER BY enrollments DESC
      LIMIT 10
    `
      );

      return {
        labels: result.rows.map((row) => row.label),
        enrollments: result.rows.map((row) => Number(row.enrollments)),
      };
    } catch (error) {
      throw error;
    }
  },
};

export default CourseModel;
