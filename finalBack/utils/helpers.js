import AssignmentModel from "../models/Assignment.js";
import LessonModel from "../models/Lesson.js";
import ModuleModel from "../models/Module.js";
import CourseModel from "../models/Course.js";

// Sanitize user data for client response
export const sanitizeUser = (user) => {
  const { id, email, name, avatar, provider, is_verified, created_at } = user;
  return { id, email, name, avatar, provider, is_verified, created_at };
};

// Generate random string
export const generateRandomString = (length = 32) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Create API response format
export const createResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
};

// Helper to get course from assignment ID
export async function getCourseFromAssignment(assignmentId) {
  const assignment = await AssignmentModel.findById(assignmentId);
  if (!assignment) return null;
  const lesson = await LessonModel.findById(assignment.lesson_id);
  if (!lesson) return null;
  const module = await ModuleModel.findById(lesson.module_id);
  if (!module) return null;
  const course = await CourseModel.findById(module.course_id);
  return course;
}
