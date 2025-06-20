import { Router } from "express";
import CategoryController from "../controllers/categoryController.js";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware.js";
 
const router = Router();

// Public routes
router.get("/", CategoryController.getAllCategories);

// Admin-only routes
router.post(
  "/",
  authenticateJWT,
  authorize(["admin"]),
  CategoryController.createCategory
);
router.put("/:id", authenticateJWT, authorize(["admin"]), CategoryController.updateCategory);
router.delete("/:id", authenticateJWT, authorize(["admin"]), CategoryController.deleteCategory);
router.get("/:id", CategoryController.getCategory);


export default router;
