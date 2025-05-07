const redisClient = require("../database/redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./logger");

const globalRateLimiter = (req, res, next) => {
  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1,
  });

  limiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`The rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests!" });
    });
};

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
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
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = { globalRateLimiter, sensitiveEndpointsLimiter };
