const Search = require("../models/Search");
const invalidateAllSearchCaches = require("../utils/invalidateSearchCaches");
const logger = require("../utils/logger");

const handlePostCreated = async (event) => {
  try {
    const { postId, userId, content, createdAt } = event;

    const newSearchPost = new Search({
      postId,
      userId,
      content,
      createdAt,
    });

    await newSearchPost.save();
    logger.info(
      `Search post created: ${event.postId}, ${newSearchPost._id.toString()}`
    );

    await invalidateAllSearchCaches();
  } catch (error) {
    logger.error(error, "Error handling post creation event");
    throw error;
  }
};

const handlePostDeleted = async (event) => {
  try {
    const { postId } = event;

    const deletedSearchResult = await Search.findOneAndDelete({ postId });

    if (deletedSearchResult) {
      logger.info(`Search post deleted`, { postId });
      await invalidateAllSearchCaches();
    } else {
      logger.warn(`No search result found for post`, { postId });
    }
  } catch (error) {
    logger.error(`Error handling post.deleted event`, { error, event });
    throw error;
  }
};

module.exports = { handlePostCreated, handlePostDeleted };
