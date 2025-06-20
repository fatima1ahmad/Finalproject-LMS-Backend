import express from "express";
import multer from "multer";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getUsers,
} from "../controllers/userController.js";
import {
  authenticate,
  authenticateJWT,
} from "../middlewares/authMiddleware.js";
import { validateUserProfile } from "../utils/enrollmentValidation.js";
import { isStudent, isAdmin } from "../middlewares/roleMiddleware.js";
const router = express.Router();
const upload = multer();
router.use(authenticateJWT);

// User profile routes (session-based authentication)
// router.get("/profile",authenticateJWT, getProfile); // Only students can access
// router.put("/profile", isAuthenticated, validateUserProfile, updateProfile);
// router.delete("/profile", isAuthenticated, deleteAccount);

// JWT-based routes
router.delete("/profile-jwt", authenticateJWT, deleteAccount);
router.get("/profile-jwt", authenticateJWT, getProfile);
router.put("/profile-jwt", authenticateJWT,upload.single("avatar"), validateUserProfile, updateProfile);

// Admin routes
router.get("/all", isAdmin, getUsers); // Only admins can access

export default router;
