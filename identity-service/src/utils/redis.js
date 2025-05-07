const Redis = require("ioredis");

const clientRedis = new Redis(process.env.REDIS_URL);

module.exports = clientRedis;
