const clientRedis = require("../utils/redis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => clientRedis.call(...args),
  }),
});

module.exports = { rateLimiter };
