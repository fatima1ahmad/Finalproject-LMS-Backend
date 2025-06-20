import CategoryModel from "../models/Category.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../utils/categoryValidation.js";
const CategoryController = {
  async createCategory(req, res, next) {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      if (error) throw new Error(error.details[0].message);
      // Only admin can create categories
      if (req.user.role !== "admin") {
        throw new Error("Only administrators can create categories");
      }
      const { name } = value;
      const category = await CategoryModel.create(name);
      res.status(201).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  },
  async updateCategory(req, res, next) {
    try {
      const { error, value } = updateCategorySchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }
      //only admins can update categories
      if (req.user.role !== "admin") {
        throw new Error("Only administrators can update categories");
      }
      const category = await CategoryModel.updateCategory(req.params.id, value);
      if (!category) throw new Error("Category not found");
      res.json({
        success: true,
        category,
      });
    } catch (err) {
      next(err);
    }
  },
  async deleteCategory(req, res, next) {
    try {
      // Only admin can delete categories
      if (req.user.role !== "admin") {
        throw new Error("Only administrators can delete categories");
      }
      const success = await CategoryModel.deleteCategory(req.params.id);
      res.json({
        success,
        message: success ? "Category deleted" : "Category not found",
      });
    } catch (err) {
      next(err);
    }
  },
  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryModel.findAll();
      res.json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  },
  async getCategory(req, res, next) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) throw new Error("Category not found");
      res.json({
        success: true,
        category,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default CategoryController;
