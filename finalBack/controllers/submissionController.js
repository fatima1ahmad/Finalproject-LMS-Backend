import multer from "multer";

import SubmissionModel from "../models/Submission.js";
import AssignmentModel from "../models/Assignment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

import LessonModel from "../models/Lesson.js";
import ModuleModel from "../models/Module.js";
import CourseModel from "../models/Course.js";
const upload = multer();

const SubmissionController = {
  // async submitAssignment(req, res, next) {
  //   try {
  //     const { assignment_id, submission_url } = req.body;

  //     // Verify assignment exists
  //     const assignment = await AssignmentModel.findById(assignment_id);
  //     if (!assignment) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Assignment not found",
  //       });
  //     }

  //     // Check if student is enrolled in the course
  //     const lesson = await LessonModel.findById(assignment.lesson_id);
  //     const module = await ModuleModel.findById(lesson.module_id);
  //     //to check if the user is enrolled in the course from the enrollment model
  //     const course = await CourseModel.findById(module.course_id);
  //     const submission = await SubmissionModel.create({
  //       assignment_id,
  //       user_id: req.user.id,
  //       submission_url,
  //     });

  //     res.status(201).json({
  //       success: true,
  //       submission,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
  submitAssignment: [
    upload.single("file"), // الملف رح يكون في الحقل "file"
    async (req, res, next) => {
      try {
        const { assignment_id } = req.body;
        if (!assignment_id) {
          return res
            .status(400)
            .json({ success: false, message: "assignment_id is required" });
        }

        // تحقق من وجود الواجب
        const assignment = await AssignmentModel.findById(assignment_id);
        if (!assignment) {
          return res
            .status(404)
            .json({ success: false, message: "Assignment not found" });
        }

        // تحقق من إرسال ملف
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "File is required" });
        }

        // رفع الملف إلى Cloudinary مع resource_type:auto ليقبل أي نوع ملف
        const result = await uploadToCloudinary(req.file.buffer, {
          resource_type: "auto",
        });

        if (!result.secure_url) {
          return res
            .status(500)
            .json({ success: false, message: "Error uploading file to cloud" });
        }

        // تحقق من تسجيل الطالب في الكورس (اختياري - حسب منطقك)
        const lesson = await LessonModel.findById(assignment.lesson_id);
        const module = await ModuleModel.findById(lesson.module_id);
        const course = await CourseModel.findById(module.course_id);

        // إنشاء السوبميشن مع رابط الملف المرفوع
        const submission = await SubmissionModel.create({
          assignment_id,
          user_id: req.user.id,
          submission_url: result.secure_url,
        });

        res.status(201).json({
          success: true,
          submission,
        });
      } catch (error) {
        next(error);
      }
    },
  ],

  async getSubmission(req, res, next) {
    try {
      const submission = await SubmissionModel.findById(req.params.id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      // Authorization check
      if (req.user.role === "student" && submission.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view this submission",
        });
      }

      res.json({
        success: true,
        submission,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSubmissionsByAssignment(req, res, next) {
    try {
      // Verify assignment exists and get course info
      const assignment = await AssignmentModel.findById(
        req.params.assignmentId
      );
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      const lesson = await LessonModel.findById(assignment.lesson_id);
      const module = await ModuleModel.findById(lesson.module_id);
      const course = await CourseModel.findById(module.course_id);

      // Authorization check
      if (
        req.user.role === "student" ||
        (req.user.role === "instructor" && course.instructor_id !== req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Studant not allow to view these submissions",
        });
      }

      const submissions = await SubmissionModel.findByAssignmentId(
        req.params.assignmentId
      );
      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  },

  async gradeSubmission(req, res, next) {
    try {
      const submission = await SubmissionModel.findById(req.params.id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      // Get course info for authorization
      const assignment = await AssignmentModel.findById(
        submission.assignment_id
      );
      const lesson = await LessonModel.findById(assignment.lesson_id);
      const module = await ModuleModel.findById(lesson.module_id);
      const course = await CourseModel.findById(module.course_id);

      // Only instructor or admin can grade
      if (course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to grade this submission",
        });
      }

      const updatedSubmission = await SubmissionModel.grade(
        req.params.id,
        req.body.grade,
        req.body.feedback
      );

      res.json({
        success: true,
        submission: updatedSubmission,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSubmission(req, res, next) {
    try {
      const submission = await SubmissionModel.findById(req.params.id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      let isAuthorized = false;

      if (req.user.role === "admin") {
        isAuthorized = true;
      } else if (req.user.role === "instructor") {
        const assignment = await AssignmentModel.findById(
          submission.assignment_id
        );
        const lesson = await LessonModel.findById(assignment.lesson_id);
        const module = await ModuleModel.findById(lesson.module_id);
        const course = await CourseModel.findById(module.course_id);
        if (course.instructor_id === req.user.id) isAuthorized = true;
      } else if (
        req.user.role === "student" &&
        submission.user_id === req.user.id
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this submission",
        });
      }

      await SubmissionModel.delete(req.params.id);
      res.json({
        success: true,
        message: "Submission deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default SubmissionController;
