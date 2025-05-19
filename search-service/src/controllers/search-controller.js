const { asyncHandler } = require("../middleware/errorHandler");
const Search = require("../models/Search");
const logger = require("../utils/logger");
const redisClient = require("../utils/redis");

const withCache = async (key, ttl, fetchData) => {
  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Cache hit for key ${key}`);
      return JSON.parse(cachedData);
    }

    const data = await fetchData();

    await redisClient.setex(key, ttl, JSON.stringify(data));
    logger.info(`Cache set for key ${key}`);

    return data;
  } catch (error) {
    logger.warn(`Failed to cache data for key: ${key} — ${error.message}`);
    return await fetchData();
  }
};

const searchPostController = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const userId = req.user?.userId;

  const sanitizedQuery = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  const cacheKey = `search:${sanitizedQuery}`;

  const results = await withCache(cacheKey, 300, async () => {
    const searchData = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean()
      .catch((error) => {
        logger.error(`MongoDB text search failed`, { error, query, userId });
        throw new APIError(500, "Search operation failed");
      });

    return searchData;
  });

  logger.info(`Search executed`, {
    query,
    userId,
    resultCount: results.length,
  });

  return res.status(200).json({
    success: true,
    results,
    message: results.length ? "Search completed" : "No results found",
  });
});

module.exports = { searchPostController };
