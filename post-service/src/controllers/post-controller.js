const {
  asyncHandler,
  throwValidationError,
  APIError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateCreatePost, sanitizeInput } = require("../utils/validation");
const Post = require("../models/Post");
const redisClient = require("../utils/redis");
const invalidatePostCaches = require("../utils/invalidateCache");
const { CACHE_TTL, DEFAULT_PAGE_LIMIT } = require("../config/constants");
const { publishEvent } = require("../utils/rabbitmq");

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
  } catch (err) {
    logger.warn(`Failed to cache data for key: ${key} — ${err.message}`);
    return await fetchData();
  }
};

const createNewPost = asyncHandler(async (req, res) => {
  logger.info("Create post endpoint hit", { userId: req.user?.userId });

  const { error, value } = validateCreatePost(req.body);

  if (error) {
    logger.warn("Validation error", error.details[0].message);
    throwValidationError(error.details[0].message);
  }

  const { content, mediaIds } = sanitizeInput(value);
  const newPost = new Post({
    user: req.user.userId,
    content,
    mediaIds: mediaIds || [],
  });

  await newPost.save();

  logger.info("Created a new post successfully", { postId: newPost._id });

  await publishEvent("post.created", {
    postId: newPost._id.toString(),
    userId: newPost.user.toString(),
    content: newPost.content,
    createdAt: newPost.createdAt,
  });

  await invalidatePostCaches(newPost._id.toString());

  return res.status(201).json({
    success: true,
    postId: newPost._id,
    message: "Created post successfully",
  });
});

const getAllPosts = asyncHandler(async (req, res) => {
  logger.info("Get all posts endpoint hit", { userId: req.user?.userId });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || DEFAULT_PAGE_LIMIT;
  const startIndex = (page - 1) * limit;

  const cacheKey = `posts:${page}:${limit}`;

  const result = await withCache(cacheKey, CACHE_TTL.POSTS_LIST, async () => {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts,
      limit,
      totalPages,
      totalPosts,
      page,
    };
  });

  return res.status(200).json({ success: true, ...result });
});

const getPost = asyncHandler(async (req, res) => {
  logger.info("Get post endpoint hit", { postId: req.params.id });

  const id = req.params.id;
  const cacheKey = `post:${id}`;

  const post = await withCache(cacheKey, CACHE_TTL.SINGLE_POST, async () => {
    const post = await Post.findById(id).lean();

    if (!post) {
      logger.warn("Post not found!", { postId: id });
      throw new APIError(404, "Post not found");
    }

    return post;
  });

  return res.status(200).json({ success: true, post });
});

const deletePost = asyncHandler(async (req, res) => {
  logger.info("Delete post hit...", {
    postId: req.params.id,
    userId: req.user?.userId,
  });

  const id = req.params.id;

  const post = await Post.findOneAndDelete({
    _id: id,
    user: req.user.userId,
  });

  if (!post) {
    logger.warn(`Failed to delete Post`, { postId: id });
    throw new APIError(400, "Failed to delete post! Please try again!");
  }

  await publishEvent("post.deleted", {
    postId: post._id.toString(),
    userId: req.user.userId,
    mediaIds: post.mediaIds,
  });

  await invalidatePostCaches(post._id.toString());
  logger.info("Deleted post successfully", { postId: id });

  return res.status(200).json({
    success: true,
    message: "Delete post successfully!",
  });
});

module.exports = { createNewPost, getAllPosts, getPost, deletePost };
