const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../utils/redis");

const senstiveEndPointsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

module.exports = senstiveEndPointsRateLimiter;
