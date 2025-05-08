const {
  asyncHandler,
  throwValidationError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");

const createNewPost = asyncHandler(async (req, res) => {
  logger.info("Create post endpoint hit...");

  const { error } = validateCreatePost(req.body);

  if (error) {
    logger.warn("Validation error", error.details[0].message);
    throwValidationError(error.details[0].message);
  }

  const { content, mediaIds } = req.body;

  const newPost = new Post({
    user: req.user.userId,
    content,
    mediaIds: mediaIds || [],
  });

  await newPost.save();

  logger.info("Created a new post successfully!");

  return res.status(201).json({
    success: true,
    message: "Created a new post successfully!",
  });
});

module.exports = { createNewPost };
