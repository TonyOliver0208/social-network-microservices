const {
  asyncHandler,
  throwValidationError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");
const redisClient = require("../utils/redis");

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

const getAllPosts = asyncHandler(async (req, res) => {
  logger.info("Get all posts hit...");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  const cachedKey = `posts:page:${page}:limit:${limit}`;
  const cachedPosts = await redisClient.get(cachedKey);

  if (cachedPosts) {
    return res.status(200).json({
      posts: JSON.parse(cachedPosts),
    });
  }

  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .lean();

  const totalPosts = await Post.countDocuments();
  const totalPages = Math.ceil(totalPosts / limit);

  const result = {
    currentPage: page,
    totalPosts,
    totalPages,
    posts,
    limit,
  };

  await redisClient.setex(cachedKey, 300, JSON.stringify(result));

  return res.status(200).json(result);
});

module.exports = { createNewPost, getAllPosts };
