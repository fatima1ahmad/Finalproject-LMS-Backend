import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserModel = {
  // Create a new user (local or OAuth)
  async create({
    name,
    email,
    password,
    role,
    avatar,
    oauth_id,
    oauth_provider,
  }) {
    try {
      if (!email || !name || (!password && !oauth_id)) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
      }

      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(
          password,
          parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
        );
      }

      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, avatar, oauth_id, oauth_provider)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role, avatar, oauth_id, oauth_provider, created_at`,
        [name, email, hashedPassword, role, avatar, oauth_id, oauth_provider]
      );

      if (!rows || rows.length === 0) {
        const error = new Error("User creation failed");
        error.status = 500;
        throw error;
      }

      return rows[0];
    } catch (error) {
      if (error.code === "23505") {
        error.message = "Email already exists";
        error.status = 409;
      } else {
        error.message = `User creation failed: ${error.message}`;
        error.status = error.status || 500;
      }
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      if (!email) {
        const error = new Error("Email is required");
        error.status = 400;
        throw error;
      }
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      error.message = `Failed to find user by email: ${error.message}`;
      error.status = error.status || 500;
      throw error;
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      if (!id) {
        const error = new Error("User ID is required");
        error.status = 400;
        throw error;
      }
      const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [
        id,
      ]);
      return rows[0] || null;
    } catch (error) {
      error.message = `Failed to find user by ID: ${error.message}`;
      error.status = error.status || 500;
      throw error;
    }
  },

  // Find user by Google OAuth ID
  async findByGoogleId(oauthId) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE oauth_id = $1`,
        [oauthId]
      );
      return rows[0] || null;
    } catch (error) {
      error.status = 500;
      error.message = "Error finding user by Google ID: " + error.message;
      throw error;
    }
  },

  // Update user (name, avatar, role, etc.)
  async update(id, userData) {
    try {
      const { name, avatar, role, email } = userData;
      const { rows } = await pool.query(
        `UPDATE users
         SET name = COALESCE($2, name),
             avatar = COALESCE($3, avatar),
             role = COALESCE($4, role),
             email = COALESCE($5, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, name, avatar, role, email]
      );
      return rows[0];
    } catch (error) {
      error.status = 500;
      error.message = "Error updating user: " + error.message;
      throw error;
    }
  },

  // Delete user (Soft delete)
  async delete(id) {
    try {
      const { rows } = await pool.query(
        `UPDATE users SET is_active = false, deleted_at = NOW() WHERE id = $1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      error.status = 500;
      error.message = "Error deleting user: " + error.message;
      throw error;
    }
  },

  // Get all users (admin function)
  async getAll() {
    try {
      const { rows } = await pool.query(
        `SELECT id, email, name, avatar, role, oauth_provider, is_active, created_at, updated_at, last_login, deleted_at
         FROM users
         ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      error.status = 500;
      error.message = "Error getting all users: " + error.message;
      throw error;
    }
  },

  // Link OAuth provider to user
  async linkOAuthProvider(userId, { provider, providerId, email }) {
    try {
      const { rows } = await pool.query(
        `UPDATE users
         SET oauth_provider = $1,
             oauth_id = $2,
             email = COALESCE($3, email),
             is_active = true
         WHERE id = $4
         RETURNING id, email, name, role, oauth_provider`,
        [provider, providerId, email, userId]
      );
      return rows[0];
    } catch (error) {
      error.status = 500;
      error.message = "Error linking OAuth provider: " + error.message;
      throw error;
    }
  },

  // Generate JWT token
  generateToken(userId) {
    if (!userId) {
      const error = new Error("User ID is required for token generation");
      error.status = 400;
      throw error;
    }
    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT secret is not configured");
      error.status = 500;
      throw error;
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  },

  // Verify password
  async verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) return false;
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  },

  // Update password
  async updatePassword(userId, newPassword) {
    try {
      if (!newPassword || !userId) {
        const error = new Error("New password and user ID are required");
        error.status = 400;
        throw error;
      }
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
      );
      const { rowCount } = await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [hashedNewPassword, userId]
      );
      if (rowCount === 0) {
        const error = new Error("User not found or password not updated");
        error.status = 404;
        throw error;
      }
      return true;
    } catch (error) {
      error.message = `Password update failed: ${error.message}`;
      error.status = error.status || 500;
      throw error;
    }
  },

  // Set user active/inactive
  async setActiveStatus(userId, isActive) {
    try {
      await pool.query("UPDATE users SET is_active = $1 WHERE id = $2", [
        isActive,
        userId,
      ]);
    } catch (error) {
      error.status = 500;
      error.message = "Error updating active status: " + error.message;
      throw error;
    }
  },

  // Update last login timestamp
  async updateLastLogin(userId) {
    try {
      if (!userId) {
        const error = new Error("User ID is required");
        error.status = 400;
        throw error;
      }
      await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [
        userId,
      ]);
      return true;
    } catch (error) {
      error.message = `Failed to update last login: ${error.message}`;
      error.status = error.status || 500;
      throw error;
    }
  },
  async getActivityReport(timeRange = "monthly") {
    try {
      let query;
      const params = [];

      switch (timeRange) {
        case "daily":
          query = query = `
  SELECT 
    DATE_TRUNC('hour', created_at) AS time_label,
    COUNT(*) AS new_signups,
    SUM(CASE WHEN last_login >= DATE_TRUNC('hour', created_at) THEN 1 ELSE 0 END) AS active_users
  FROM users
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY time_label
  ORDER BY time_label`;
          break;

        case "weekly":
          // بديل باستخدام last_login فقط
          query = `
  SELECT 
    DATE_TRUNC('day', created_at) AS time_label,
    COUNT(*) AS new_signups,
    SUM(CASE WHEN last_login >= DATE_TRUNC('day', created_at) THEN 1 ELSE 0 END) AS active_users
  FROM users
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY time_label
  ORDER BY time_label`;
          break;

        case "monthly":
        default:
          query = `
  SELECT 
    DATE_TRUNC('day', created_at) AS time_label,
    COUNT(*) AS new_signups,
    SUM(CASE WHEN last_login >= DATE_TRUNC('day', created_at) THEN 1 ELSE 0 END) AS active_users
  FROM users
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY time_label
  ORDER BY time_label`;
      }

      const { rows } = await pool.query(query, params);

      if (!rows || rows.length === 0) {
        return {
          labels: [],
          activeUsers: [],
          newSignups: [],
        };
      }

      return {
        labels: rows.map((row) =>
          timeRange === "monthly" || timeRange === "weekly"
            ? new Date(row.time_label).toLocaleDateString()
            : new Date(row.time_label).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
        ),
        activeUsers: rows.map((row) => Number(row.active_users || 0)),
        newSignups: rows.map((row) => Number(row.new_signups || 0)),
      };
    } catch (error) {
      console.error(`Error in getActivityReport (${timeRange}):`, error);
      throw error;
    }
  },
};

export default UserModel;
