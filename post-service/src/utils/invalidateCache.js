const redisClient = require("./redis");
const logger = require("./logger");

async function invalidatePostCaches(postId) {
  try {
    const singlePostKey = `post:${postId}`;
    await redisClient.unlink(singlePostKey);

    const stream = await redisClient.scanStream({
      match: "posts:*",
      count: 100,
    });
    const keysToDelete = [];

    for await (const keys of stream) {
      keysToDelete.push(...keys);
    }

    if (keysToDelete.length > 0) {
      await redisClient.unlink(keysToDelete);
    }

    logger.info(`Invalidated caches for post ${postId}`);
  } catch (err) {
    logger.error(`Failed to invalidate caches for post ${postId}`, { err });
    throw new Error("Cache invalidation failed");
  }
}

module.exports = invalidatePostCaches;
