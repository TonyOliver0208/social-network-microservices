const express = require("express");
const authenticateRequest = require("../middleware/authMiddleware");
const {
  createNewPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post-controller");

const router = express.Router();

router.use(authenticateRequest);

router.post("/create-post", createNewPost);
router.get("/all-posts", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

module.exports = router;
