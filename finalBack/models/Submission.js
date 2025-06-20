import { pool } from "../config/db.js";

const SubmissionModel = {
  // Create a new submission
  async create({ assignment_id, user_id, submission_url }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO submissions 
         (assignment_id, user_id, submission_url) 
         VALUES ($1, $2, $3)
         RETURNING *`,
        [assignment_id, user_id, submission_url]
      );
      return rows[0];
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  },

  // Find a submission by its ID, including student and assignment info
  async findById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT s.*, u.name as student_name, a.title as assignment_title
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         JOIN assignments a ON s.assignment_id = a.id
         WHERE s.id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding submission by ID:", error);
      throw error;
    }
  },

  // Find all submissions for a specific assignment
  async findByAssignmentId(assignmentId) {
    try {
      const { rows } = await pool.query(
        `SELECT s.*, u.name as student_name, u.email as student_email
         FROM submissions s
         JOIN users u ON s.user_id = u.id
         WHERE s.assignment_id = $1
         ORDER BY s.submitted_at DESC`,
        [assignmentId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding submissions by assignment ID:", error);
      throw error;
    }
  },

  // Grade a submission and add feedback
  async grade(id, grade, feedback) {
    try {
      const { rows } = await pool.query(
        `UPDATE submissions 
         SET grade = $1,
             feedback = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [grade, feedback, id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error grading submission:", error);
      throw error;
    }
  },

  // Delete a submission by its ID
  async delete(id) {
    try {
      await pool.query("DELETE FROM submissions WHERE id = $1", [id]);
      return true;
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw error;
    }
  },
};

export default SubmissionModel;
