import { body, validationResult } from 'express-validator';
import { createResponse } from '../utils/helpers.js';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      createResponse(false, 'Validation failed', null, errors.array())
    );
  }
  next();
};

// User profile validation
export const validateUserProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// enrollment validation functions
export function validateEnrollmentInput(data) {
  const { userId, courseId } = data;

  if (!userId || !courseId) {
    throw new Error('User ID and Course ID are required');
  }

  if (isNaN(userId) || isNaN(courseId)) {
    throw new Error('User ID and Course ID must be numbers');
  }

  if (userId <= 0 || courseId <= 0) {
    throw new Error('IDs must be positive numbers');
  }
}


export function validateLessonCompletionInput(data) {
  const { lessonId, userId } = data;

  if (!lessonId || !userId) {
    throw new Error('Lesson ID and User ID are required');
  }

  if (isNaN(lessonId) || isNaN(userId)) {
    throw new Error('Lesson ID and User ID must be numbers');
  }

  if (lessonId <= 0 || userId <= 0) {
    throw new Error('IDs must be positive numbers');
  }
}


export function validateProgressSummaryInput(data) {
  const { courseId, userId } = data;

  if (!courseId || !userId) {
    throw new Error('Course ID and User ID are required');
  }

  if (isNaN(courseId) || isNaN(userId)) {
    throw new Error('Course ID and User ID must be numbers');
  }

  if (courseId <= 0 || userId <= 0) {
    throw new Error('IDs must be positive numbers');
  }
}