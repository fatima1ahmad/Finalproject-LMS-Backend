import enrollmentService from "../models/Enrollment.js";
import { validateEnrollmentInput } from "../utils/enrollmentValidation.js";
import EnrollmentModel from "../models/EnrollemtModel.js"; // نموذج تسجيلات
import CourseModel from "../models/Course.js";

export default {
  async getAllEnrollmentsByInstructor(req, res, next) {
    try {
      const instructorId = req.user.id;
      const courses = await CourseModel.findByInstructor(instructorId);
      const courseIds = courses.map((c) => c.id);

      // لو ما فيه كورسات يرجع مصفوفة فارغة عشان ما ينكسر
      if (courseIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      const enrollments = await EnrollmentModel.findAllByCourseIds(courseIds);

      res.json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Enroll a user in a course
   */
  async enrollUser(req, res) {
    try {
      const { courseId } = req.body;
      const userId = req.user.id;

      // Validate input
      validateEnrollmentInput({ userId, courseId });

      // Check if user is student
      if (req.user.role !== "student") {
        return res
          .status(403)
          .json({ error: "Only students can enroll in courses" });
      }

      // Create enrollment
      const enrollment = await enrollmentService.createEnrollment(
        userId,
        courseId
      );

      res.status(201).json({
        success: true,
        message: "Successfully enrolled in course",
        enrollment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get enrollment details
   */
  async getEnrollment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get enrollment
      const enrollment = await enrollmentService.getEnrollmentById(id);

      // Check if the requesting user owns this enrollment
      if (enrollment.user_id !== userId && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Unauthorized to view this enrollment" });
      }

      res.status(200).json({
        success: true,
        enrollment,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get all enrollments for the current user
   */
  async getUserEnrollments(req, res) {
    try {
      const userId = req.user.id;

      // Get all enrollments for user
      const enrollments = await enrollmentService.getUserEnrollments(userId);

      res.status(200).json({
        success: true,
        count: enrollments.length,
        enrollments,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get detailed course progress including modules and lessons
   */
  async getCourseProgressDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get enrollment first to check ownership
      const enrollment = await enrollmentService.getEnrollmentById(id);

      // Check if the requesting user owns this enrollment
      if (enrollment.user_id !== userId && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Unauthorized to view this progress" });
      }

      // Get detailed progress
      const progressDetails = await enrollmentService.getCourseProgressDetails(
        id,
        userId
      );

      res.status(200).json(progressDetails);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Mark a lesson as completed
   */
  async markLessonCompleted(req, res) {
    try {
      const { lessonId } = req.body;
      const userId = req.user.id;

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          error: "Lesson ID is required",
        });
      }

      // Mark lesson as completed
      const completion = await enrollmentService.markLessonCompleted(
        userId,
        lessonId
      );

      // Get course ID for the lesson
      const courseId = await enrollmentService.getItemCourseId(
        lessonId,
        "lesson"
      );

      if (!courseId) {
        return res.status(404).json({
          success: false,
          error: "Course not found for this lesson",
        });
      }

      // Calculate and update overall progress
      const updatedProgress = await enrollmentService.calculateProgress(
        userId,
        courseId
      );

      res.status(200).json({
        success: true,
        message: "Lesson marked as completed",
        completion,
        progress: updatedProgress,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * Get user progress summary for a course
   */
  async getProgressSummary(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error: "Course ID is required",
        });
      }

      // Check if user is enrolled
      const isEnrolled = await enrollmentService.checkUserEnrollment(
        userId,
        courseId
      );
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          error: "User is not enrolled in this course",
        });
      }

      const summary = await enrollmentService.getUserProgressSummary(
        userId,
        courseId
      );
      const completedLessons = await enrollmentService.getCompletedLessons(
        userId,
        courseId
      );

      res.status(200).json({
        success: true,
        summary,
        completedLessons,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
