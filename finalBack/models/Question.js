import { pool } from "../config/db.js";

export default {
  // إنشاء سؤال جديد
  async create(quiz_id, questionData) {
    try {
      const {
        question,
        options,
        correct_answer,
        score = 1,
        order = 1,
      } = questionData;

      const query = `
        INSERT INTO questions (quiz_id, question, options, correct_answer, score, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const result = await pool.query(query, [
        quiz_id,
        question,
        JSON.stringify(options),
        correct_answer,
        score,
        order,
      ]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      error.message = `Failed to create question: ${error.message}`;
      throw error;
    }
  },

  // الحصول على سؤال بواسطة ID
  async findById(id) {
    try {
      const query = `
        SELECT * FROM questions 
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to find question: ${error.message}`;
      throw error;
    }
  },

  // تحديث سؤال
  async update(id, updates) {
    try {
      const { question, options, correct_answer, score, order } = updates;
      const query = `
        UPDATE questions
        SET question = COALESCE($2, question),
            options = COALESCE($3, options),
            correct_answer = COALESCE($4, correct_answer),
            score = COALESCE($5, score),
            "order" = COALESCE($6, "order"),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [
        id,
        question,
        options ? JSON.stringify(options) : undefined,
        correct_answer,
        score,
        order,
      ]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      error.message = `Failed to update question: ${error.message}`;
      throw error;
    }
  },

  // حذف سؤال
  async delete(id) {
    try {
      const query = `
        DELETE FROM questions
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      error.message = `Failed to delete question: ${error.message}`;
      throw error;
    }
  },

  // الحصول على جميع أسئلة اختبار معين
  async findByQuizId(quiz_id) {
    try {
      const query = `
        SELECT * FROM questions
        WHERE quiz_id = $1
        ORDER BY "order" ASC
      `;
      const result = await pool.query(query, [quiz_id]);
      return result.rows;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to find questions by quiz: ${error.message}`;
      throw error;
    }
  },
};
