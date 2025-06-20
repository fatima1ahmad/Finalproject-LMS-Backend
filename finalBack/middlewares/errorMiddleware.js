export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.status || err.statusCode || 500;
  // Default to 500 if statusCode is not set (internal server error)
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// If the requested resource is not found, return a 404 error (API endpoint not found)
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};