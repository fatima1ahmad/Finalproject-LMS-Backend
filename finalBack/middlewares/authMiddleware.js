import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { createResponse } from "../utils/helpers.js";

// JWT authentication middleware (strict)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Authentication token missing",
            null,
            "No token provided"
          )
        );
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json(
          createResponse(
            false,
            "JWT secret not configured",
            null,
            "Server configuration error"
          )
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json(createResponse(false, "User not found", null, "Invalid token"));
    }

    req.user = { id: user.id, role: user.role, avatar: user.avatar };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(
          createResponse(false, "Invalid or expired token", null, error.message)
        );
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res
        .status(403)
        .json(
          createResponse(
            false,
            "Unauthorized access",
            null,
            "Insufficient permissions"
          )
        );
    }
    next();
  };
};

// Check if user is authenticated (session-based)
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res
    .status(401)
    .json(
      createResponse(
        false,
        "Authentication required",
        null,
        "User not authenticated"
      )
    );
};

// JWT authentication middleware (strict, for APIs)
export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(
          createResponse(
            false,
            "Access token required",
            null,
            "No token provided"
          )
        );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json(createResponse(false, "Invalid token", null, "User not found"));
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(createResponse(false, "Invalid token", null, error.message));
  }
};

// Optional JWT authentication (user may or may not be logged in)
export const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore error, proceed without user
    next();
  }
};
