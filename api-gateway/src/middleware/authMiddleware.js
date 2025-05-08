const logger = require("../../../post-service/src/utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid or expired token");
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = validateToken;
