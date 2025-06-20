export const isInstructor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  if (req.user.role !== "instructor") {
    return res.status(403).json({
      error: "Instructor access required",
      code: "FORBIDDEN",
      currentRole: req.user.role,
      requiredRole: "instructor",
      userId: req.user.id,
    });
  }

  if (req.user.is_approved === false) {
    return res.status(403).json({
      error: "Instructor account not yet approved",
      code: "ACCOUNT_PENDING_APPROVAL",
    });
  }

  return next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required",
      userId: req.user.id,
    });
  }

  return next();
};

// Middleware to verify if the user is an admin
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: "Admin privileges required" 
    });
  }
  next();
};

export const isInstructorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  if (!["instructor", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Instructor or admin access required",
      code: "FORBIDDEN",
      currentRole: req.user.role,
      requiredRoles: ["instructor", "admin"], 
      userId: req.user.id
    });
  }

  if (req.user.role === "instructor" && req.user.is_approved === false) {
    return res.status(403).json({
      error: "Instructor account not yet approved",
      code: "ACCOUNT_PENDING_APPROVAL",
    });
  }

  return next();
};

export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Not authenticated",
      code: "UNAUTHORIZED",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      error: "Student access required",
      code: "FORBIDDEN",
      currentRole: req.user.role,
      requiredRole: "student",
      userId: req.user.id,
    });
  }

  return next();
};




