const redisClient = require("../utils/redis");

async function invalidatePostCaches(input) {
  const cachedKey = `post:${input}`;

  await redisClient.del(cachedKey);

  const cachedKeys = await redisClient.keys("posts:*");

  if (cachedKeys.length > 0) {
    await redisClient.del(cachedKeys);
  }
}

module.exports = invalidatePostCaches;
