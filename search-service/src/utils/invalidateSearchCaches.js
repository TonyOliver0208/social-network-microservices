const redisClient = require("./redis");
const logger = require("./logger");

async function invalidateAllSearchCaches() {
  try {
    const stream = redisClient.scanStream({
      match: "search:*",
      count: 100,
    });

    const keysToDelete = [];
    for await (const keys of stream) {
      keysToDelete.push(...keys);
    }

    if (keysToDelete.length > 0) {
      await redisClient.unlink(keysToDelete);
      logger.info(`Invalidated ${keysToDelete.length} search cache keys`);
    }
  } catch (err) {
    logger.error("Failed to invalidate search caches", { err });
    throw new Error("Cache invalidation failed");
  }
}

module.exports = invalidateAllSearchCaches;
