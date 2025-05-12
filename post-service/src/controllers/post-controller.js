const {
  asyncHandler,
  throwValidationError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");
const redisClient = require("../utils/redis");
const invalidatePostCaches = require("../utils/invalidateCache");

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

  await invalidatePostCaches(newPost._id.toString());

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

  const cacheKey = `posts:${page}:${limit}`;
  const cachedPosts = await redisClient.get(cacheKey);

  if (cachedPosts) {
    return res.status(200).json(JSON.parse(cachedPosts));
  }

  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const totalPosts = await Post.countDocuments();
  const totalPages = Math.ceil(totalPosts / limit);

  const result = {
    posts,
    limit,
    totalPages,
    totalPosts,
  };

  await redisClient.setex(cacheKey, 300, JSON.stringify(result));

  return res.json(result);
});

const getPost = asyncHandler(async (req, res) => {
  logger.info("Get post endpot hit...");

  const id = req.params.id;

  const cacheKey = `post:${id}`;
  const cachedPost = await redisClient.get(cacheKey);

  if (cachedPost) {
    return res.json(JSON.parse(cachedPost));
  }

  const post = await Post.findById(id);

  if (!post) {
    logger.warn("Post not found!", id);
    return res.status(404).json({
      success: false,
      message: "Cannot find this post! Please try again!",
    });
  }

  await redisClient.setex(cacheKey, 3600, JSON.stringify(post));

  return res.status(200).json(post);
});

const deletePost = asyncHandler(async (req, res) => {
  logger.info("Delete post hit...");

  const id = req.params.id;

  const post = await Post.findOneAndDelete({
    _id: id,
    user: req.user.userId,
  });

  if (!post) {
    logger.warn(`Failed to delete Post`, id);
    return res.status(400).json({
      success: false,
      message: "Failed to delete post! Please try again!",
    });
  }

  logger.info(`Delete the post successfully!`);

  await invalidatePostCaches(post._id.toString());

  return res.status(200).json({
    success: true,
    message: "Delete the post successfully!",
  });
});

module.exports = { createNewPost, getAllPosts, getPost, deletePost };
