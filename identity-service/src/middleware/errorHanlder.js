const logger = require("../utils/logger");

class APIError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "APIError";
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const globalErrorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof APIError) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: "Validation Error",
      detail: err.message,
    });
  }

  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occured!",
  });
};

module.exports = {
  APIError,
  asyncHandler,
  globalErrorHandler,
};
