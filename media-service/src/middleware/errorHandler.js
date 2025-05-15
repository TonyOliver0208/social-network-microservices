const logger = require("../utils/logger");

class APIError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "APIError";
  }
}

const throwValidationError = (msg) => {
  const error = new Error(msg);
  error.name = "ValidationError";

  throw error;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const globalErrorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Multer error: ${err.message}`,
    });
  }

  if (err instanceof APIError) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Validation error occured!",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server errors occured!",
  });
};

module.exports = {
  APIError,
  throwValidationError,
  asyncHandler,
  globalErrorHandler,
};
