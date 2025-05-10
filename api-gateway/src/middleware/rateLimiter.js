const clientRedis = require("../utils/redis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("../utils/logger");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests!",
    });
  },

  store: new RedisStore({
    sendCommand: (...args) => clientRedis.call(...args),
  }),
});

module.exports = { rateLimiter };
