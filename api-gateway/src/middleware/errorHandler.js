const logger = require("../utils/logger");

const globalErrorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  return res.status(500).json({
    success: false,
    message: err.message,
  });
};

module.exports = globalErrorHandler;
