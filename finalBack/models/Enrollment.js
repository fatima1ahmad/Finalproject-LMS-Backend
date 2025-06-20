import { pool } from "../config/db.js";

export default {
  /**
   * Create a new enrollment
   */
  async createEnrollment(userId, courseId) {
    try {
      // Check for existing enrollment
      const existing = await pool.query(
        `SELECT id FROM enrollments 
         WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
      );

      if (existing.rows.length > 0) {
        throw new Error("User already enrolled in this course");
      }

      // Create new enrollment with 0 progress
      const result = await pool.query(
        `INSERT INTO enrollments (user_id, course_id) 
         VALUES ($1, $2) RETURNING *`,
        [userId, courseId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },
  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM enrollments WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("Enrollment not found");
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all enrollments for a user
   */
  async getUserEnrollments(userId) {
    try {
      const result = await pool.query(
        `SELECT e.*, c.title, c.thumbnail_url 
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get course ID for an item (lesson, quiz, or assignment)
   */
  async getItemCourseId(itemId, itemType) {
    try {
      let query;
      switch (itemType) {
        case "lesson":
          query = `
            SELECT m.course_id 
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            WHERE l.id = $1`;
          break;
        case "quiz":
          query = `
            SELECT m.course_id 
            FROM quizzes q
            JOIN lessons l ON q.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE q.id = $1`;
          break;
        case "assignment":
          query = `
            SELECT m.course_id 
            FROM assignments a
            JOIN lessons l ON a.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE a.id = $1`;
          break;
        default:
          throw new Error("Invalid item type");
      }

      const result = await pool.query(query, [itemId]);
      return result.rows[0]?.course_id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is enrolled in a course
   */
  async checkUserEnrollment(userId, courseId) {
    try {
      const result = await pool.query(
        `SELECT id FROM enrollments 
         WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a lesson as completed
   */
  async markLessonCompleted(userId, lessonId) {
    try {
      const result = await pool.query(
        `INSERT INTO lesson_completions (user_id, lesson_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, lesson_id) DO NOTHING
         RETURNING *`,
        [userId, lessonId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calculate overall progress for a course
   */
  async calculateProgress(userId, courseId) {
    try {
      // Get total lessons count
      const totalLessons = await pool.query(
        `SELECT COUNT(*) as total FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1`,
        [courseId]
      );

      // Get completed lessons count
      const completedLessons = await pool.query(
        `SELECT COUNT(*) as completed FROM lesson_completions lc
         JOIN lessons l ON lc.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE lc.user_id = $1 AND m.course_id = $2`,
        [userId, courseId]
      );

      const total = parseInt(totalLessons.rows[0].total, 10) || 1; // Avoid division by zero
      const completed = parseInt(completedLessons.rows[0].completed, 10);
      const progress = Math.round((completed / total) * 100);

      // Update enrollment progress
      await pool.query(
        `UPDATE enrollments 
         SET progress = $1,
             completed_at = CASE WHEN $1 = 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
         WHERE user_id = $2 AND course_id = $3`,
        [progress, userId, courseId]
      );

      return progress;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get course progress details with completion status
   */
  async getCourseProgressDetails(enrollmentId, userId) {
    try {
      const enrollment = await this.getEnrollmentById(enrollmentId);

      // Get modules and lessons with progress
      const modules = await pool.query(
        `SELECT m.* FROM modules m
         WHERE m.course_id = $1 ORDER BY m."order"`,
        [enrollment.course_id]
      );

      // Add lessons and completion status to each module
      for (const module of modules.rows) {
        // Get lessons with completion status
        const lessons = await pool.query(
          `SELECT l.*, 
           EXISTS(
             SELECT 1 FROM lesson_completions lc 
             WHERE lc.user_id = $1 AND lc.lesson_id = l.id
           ) as is_completed
           FROM lessons l
           WHERE l.module_id = $2 ORDER BY l."order"`,
          [userId, module.id]
        );

        // Get quizzes for each lesson
        for (const lesson of lessons.rows) {
          lesson.quizzes = (
            await pool.query(
              `SELECT q.*
     FROM quizzes q
     WHERE q.lesson_id = $1`,
              [lesson.id]
            )
          ).rows.map((q) => ({
            ...q,
            is_completed: false,
            score: 0,
          }));

          // Get assignments for each lesson
          lesson.assignments = (
            await pool.query(
              `SELECT a.*, 
             EXISTS(
               SELECT 1 FROM submissions s
               WHERE s.user_id = $1 AND s.assignment_id = a.id
             ) as is_completed,
             COALESCE(
               (SELECT s.grade FROM submissions s
                WHERE s.user_id = $1 AND s.assignment_id = a.id), 0
             ) as score
             FROM assignments a
             WHERE a.lesson_id = $2`,
              [userId, lesson.id]
            )
          ).rows;
        }

        module.lessons = lessons.rows;
      }

      return {
        enrollmentId: enrollment.id,
        modules: modules.rows,
        overallProgress: enrollment.progress,
        completedLessons: await this.getCompletedLessons(
          userId,
          enrollment.course_id
        ),
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user progress summary for a course
   */
  async getUserProgressSummary(userId, courseId) {
    try {
      // Lesson completion stats
      const lessonStats = await pool.query(
        `SELECT 
           COUNT(l.id) as total_lessons,
           COUNT(lc.lesson_id) as completed_lessons
         FROM lessons l
         JOIN modules m ON l.module_id = m.id
         LEFT JOIN lesson_completions lc ON lc.lesson_id = l.id AND lc.user_id = $1
         WHERE m.course_id = $2`,
        [userId, courseId]
      );

      // Quiz stats
      const quizStats = await pool.query(
        `SELECT 
     COUNT(q.id) as total_quizzes
   FROM quizzes q
   JOIN lessons l ON q.lesson_id = l.id
   JOIN modules m ON l.module_id = m.id
   WHERE m.course_id = $1`,
        [courseId]
      );

      // Assignment stats
      const assignmentStats = await pool.query(
        `SELECT 
           COUNT(a.id) as total_assignments,
           COUNT(s.assignment_id) as completed_assignments,
           ROUND(AVG(s.grade), 2) as avg_assignment_score
         FROM assignments a
         JOIN lessons l ON a.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = $1
         WHERE m.course_id = $2`,
        [userId, courseId]
      );

      return {
        lessons: lessonStats.rows[0],
        quizzes: quizStats.rows[0],
        assignments: assignmentStats.rows[0],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get completed lessons for a user in a course
   */
  async getCompletedLessons(userId, courseId) {
    try {
      const result = await pool.query(
        `SELECT l.* FROM lesson_completions lc
         JOIN lessons l ON lc.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE lc.user_id = $1 AND m.course_id = $2`,
        [userId, courseId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};
