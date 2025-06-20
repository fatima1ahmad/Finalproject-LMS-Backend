import ModuleModel from "../models/Module.js";
import CourseModel from "../models/Course.js";
import {
  createModuleSchema,
  updateModuleSchema,
} from "../utils/moduleValidation.js";

const ModuleController = {
  async createModule(req, res, next) {
    try {
      const { error, value } = createModuleSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { course_id, title, description, order, duration } = value;

      // Verify the course exists and belongs to the instructor
      const course = await CourseModel.findById(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You can only add modules to your own courses",
        });
      }

      const module = await ModuleModel.create({
        course_id,
        title,
        description,
        order,
        duration,
      });

      res.status(201).json({
        success: true,
        module,
      });
    } catch (error) {
      next(error);
    }
  },

  async getModulesByCourse(req, res, next) {
    try {
      const modules = await ModuleModel.findByCourseId(req.params.courseId);
      res.json({
        success: true,
        data: modules,
      });
    } catch (error) {
      next(error);
    }
  },
  async getModuleById(req, res, next) {
    try {
      const module = await ModuleModel.findById(req.params.id);

      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      res.json({
        success: true,
        data: module,
      });
    } catch (error) {
      next(error);
    }
  },
  async updateModule(req, res, next) {
    try {
      const { error, value } = updateModuleSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { title, description, order, duration } = value;
      const moduleId = req.params.id;

      // Verify module exists and belongs to the instructor's course
      const module = await ModuleModel.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const course = await CourseModel.findById(module.course_id);
      if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized: You can only edit modules in your own courses",
        });
      }

      const updatedModule = await ModuleModel.update(moduleId, {
        title,
        description,
        order,
        duration,
      });
      res.json({
        success: true,
        module: updatedModule,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteModule(req, res, next) {
    try {
      const moduleId = req.params.id;

      // Verify module exists and belongs to the instructor's course
      const module = await ModuleModel.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const course = await CourseModel.findById(module.course_id);
      if (req.user.role !== "admin" && course.instructor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized: You can only delete modules in your own courses",
        });
      }

      await ModuleModel.delete(moduleId);
      res.json({
        success: true,
        message: "Module deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default ModuleController;
