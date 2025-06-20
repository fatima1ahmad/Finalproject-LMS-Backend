import { pool } from "../config/db.js";

const EnrollmentModel = {
  async findAllByCourseIds(courseIds) {
    if (!courseIds.length) return [];
    const placeholders = courseIds.map((_, idx) => `$${idx + 1}`).join(", ");
    const query = `
     SELECT 
  e.id,
  e.user_id AS student_id,
  e.course_id,
  e.enrolled_at AS enrollmentDate,
  s.name AS studentName,
  c.title AS courseTitle
FROM enrollments e
JOIN users s ON e.user_id = s.id
JOIN courses c ON e.course_id = c.id
WHERE e.course_id IN (${placeholders})
    `;

    const { rows } = await pool.query(query, courseIds);
    return rows;
  },
};

export default EnrollmentModel;
