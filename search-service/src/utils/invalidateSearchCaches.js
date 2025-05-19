const redisClient = require("./redis");
const logger = require("./logger");

async function invalidateAllSearchCaches() {
  try {
    const pattern = "search:*";
    let cursor = "0";
    do {
      const [newCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        "100"
      );
      cursor = newCursor;

      if (keys.length) {
        await redisClient.unlink(...keys);
        logger.info(`Invalidated ${keys.length} search cache keys`);
      }
    } while (cursor !== "0");
  } catch (err) {
    logger.error("Failed to invalidate search caches", { err });
    throw new Error("Cache invalidation failed");
  }
}

module.exports = invalidateAllSearchCaches;
