import { pool } from "../config/db.js";

const CategoryModel = {
  async create(name) {
    try {
      const { rows } = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
 async updateCategory(id, value) {
    try {
      const { name } = value;
      const { rows } = await pool.query(
        "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
      );
      return rows[0]; // null if not found
    } catch (error) {
      throw error;
    }
  },
  async deleteCategory(id) {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM categories WHERE id = $1",
        [id]
      );
      return rowCount > 0; // true if deleted, false if not found
    } catch (error) {
      throw error;
    }
  },
  async findAll() {
    try {
      const { rows } = await pool.query("SELECT * FROM categories");
      return rows;
    } catch (error) {
      throw error;
    }
  },

  async findById(id) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
};

export default CategoryModel;
