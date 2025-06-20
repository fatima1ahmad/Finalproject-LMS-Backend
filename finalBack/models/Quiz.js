import { pool } from "../config/db.js";

export default {
  // Quiz CRUD Operations
  async create(lesson_id, title, max_score = 10) {
    try {
      const query = `
        INSERT INTO quizzes (lesson_id, title, max_score)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await pool.query(query, [lesson_id, title, max_score]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  async findById(id) {
    try {
      const query = `
        SELECT q.*, l.title as lesson_title, l.module_id, m.title as module_title
        FROM quizzes q
        JOIN lessons l ON q.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE q.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { lesson_id, title, max_score } = updates;
      const query = `
        UPDATE quizzes
        SET lesson_id = COALESCE($2, lesson_id),
            title = COALESCE($3, title),
            max_score = COALESCE($4, max_score),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id, lesson_id, title, max_score]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  async delete(id) {
    try {
      const query = `
        DELETE FROM quizzes
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  async findByLessonId(lesson_id) {
    try {
      const query = `
        SELECT * FROM quizzes
        WHERE lesson_id = $1
        ORDER BY created_at ASC
      `;
      const result = await pool.query(query, [lesson_id]);
      return result.rows;
    } catch (error) {
      error.status = 500;
      throw error;
    }
  },

  // Quiz Submission Operations
  async createSubmission(quiz_id, user_id, answers) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Get all questions for this quiz
      const questions = await this.findQuestionsByQuizId(quiz_id);

      // 2. Calculate score and prepare graded answers
      let totalScore = 0;
      const gradedAnswers = questions.map((question) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correct_answer;
        const score = isCorrect ? question.score : 0;
        totalScore += score;

        return {
          question_id: question.id,
          question_text: question.question,
          user_answer: userAnswer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          score: score,
          max_score: question.score,
        };
      });

      // 3. Insert submission
      const submissionQuery = `
        INSERT INTO quiz_submissions 
          (quiz_id, user_id, total_score, answers) 
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const submissionResult = await client.query(submissionQuery, [
        quiz_id,
        user_id,
        totalScore,
        JSON.stringify(gradedAnswers),
      ]);

      await client.query("COMMIT");
      return submissionResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      error.status = 500;
      error.message = `Failed to create submission: ${error.message}`;
      throw error;
    } finally {
      client.release();
    }
  },

  async getQuizSubmissions(quiz_id) {
    try {
      const query = `
        SELECT 
          qs.*, 
          u.name as user_name, 
          u.email as user_email,
          q.title as quiz_title,
          q.max_score as quiz_max_score
        FROM quiz_submissions qs
        JOIN users u ON qs.user_id = u.id
        JOIN quizzes q ON qs.quiz_id = q.id
        WHERE qs.quiz_id = $1
        ORDER BY qs.submitted_at DESC
      `;
      const result = await pool.query(query, [quiz_id]);
      return result.rows;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to get submissions: ${error.message}`;
      throw error;
    }
  },

  async getUserSubmission(quiz_id, user_id) {
    try {
      const query = `
        SELECT 
          qs.*,
          q.title as quiz_title,
          q.max_score as quiz_max_score
        FROM quiz_submissions qs
        JOIN quizzes q ON qs.quiz_id = q.id
        WHERE qs.quiz_id = $1 AND qs.user_id = $2
      `;
      const result = await pool.query(query, [quiz_id, user_id]);
      return result.rows[0] || null;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to get user submission: ${error.message}`;
      throw error;
    }
  },

  async getSubmissionById(submission_id) {
    try {
      const query = `
        SELECT 
          qs.*, 
          u.name as user_name, 
          u.email as user_email,
          q.title as quiz_title,
          q.max_score as quiz_max_score
        FROM quiz_submissions qs
        JOIN users u ON qs.user_id = u.id
        JOIN quizzes q ON qs.quiz_id = q.id
        WHERE qs.id = $1
      `;
      const result = await pool.query(query, [submission_id]);
      return result.rows[0] || null;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to get submission: ${error.message}`;
      throw error;
    }
  },

  async findQuestionsByQuizId(quiz_id) {
    try {
      const query = `
        SELECT id, question, options, correct_answer, score
        FROM questions
        WHERE quiz_id = $1
        ORDER BY "order" ASC
      `;
      const result = await pool.query(query, [quiz_id]);
      return result.rows;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to find questions: ${error.message}`;
      throw error;
    }
  },

  async getQuizMaxScore(quiz_id) {
    try {
      const query = `
        SELECT COALESCE(SUM(score), 0) as max_score
        FROM questions
        WHERE quiz_id = $1
      `;
      const result = await pool.query(query, [quiz_id]);
      return result.rows[0].max_score;
    } catch (error) {
      error.status = 500;
      error.message = `Failed to get quiz max score: ${error.message}`;
      throw error;
    }
  },
};
