import { Router } from "express";
import ModuleController from "../controllers/moduleController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route
router.get("/:courseId/modules", ModuleController.getModulesByCourse);
router.get("/modules/:id", ModuleController.getModuleById);

// Protected routes
router.use(authenticate);

// Instructor/Admin routes
router.post(
  "/:courseId/modules",
  authorize(["instructor"]),
  ModuleController.createModule
);
router.put(
  "/modules/:id",
  authorize(["instructor"]),
  ModuleController.updateModule
);
router.delete(
  "/modules/:id",
  authorize(["instructor", "admin"]),
  ModuleController.deleteModule
);

export default router;
