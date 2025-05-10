const express = require("express");
const authenticateRequest = require("../middleware/authMiddleware");
const {
  createNewPost,
  getAllPosts,
} = require("../controllers/post-controller");

const router = express.Router();

router.use(authenticateRequest);

router.post("/create-post", createNewPost);
router.get("/all-posts", getAllPosts);

module.exports = router;
