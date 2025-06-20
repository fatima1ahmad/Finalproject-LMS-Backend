import express from "express";
import AdminController from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authenticateJWT); // <-- Use this for JWT-protected routes

// User Management
router.post("/users", isAdmin, AdminController.addUser);
router.put("/users/:userId", isAdmin, AdminController.updateUser);
router.delete("/users/:userId", isAdmin, AdminController.deleteUser);
router.get("/users", isAdmin, AdminController.getAllUsers);
router.get("/users/:userId", isAdmin, AdminController.getUserById);
router.get("/userEmail", isAdmin, AdminController.getUserByEmail);

// Course Management
router.get("/courses/pending", isAdmin, AdminController.getPendingCourses);
router.patch(
  "/courses/:courseId/approve",
  isAdmin,
  AdminController.approveCourse
);
router.patch(
  "/courses/:courseId/reject",
  isAdmin,
  AdminController.rejectCourse
);

// Admin Dashboard
router.get("/dashboard", authenticateJWT, isAdmin, (req, res) => {
  res.json({ message: "Welcome, admin!" });
});
// Add these to your existing adminRoutes.js
// Report Management
router.get(
  "/reports/user-activity",
  isAdmin,
  AdminController.getUserActivityReport
);
router.get(
  "/reports/course-popularity",
  isAdmin,
  AdminController.getCoursePopularityReport
);
router.get(
  "/reports/system-performance",
  isAdmin,
  AdminController.getSystemPerformanceReport
);
router.get("/reports/export", isAdmin, AdminController.exportReport);
export default router;
