const express = require("express");
const authenticateRequest = require("../middleware/authMiddleware");
const { createNewPost } = require("../controllers/post-controller");

const router = express.Router();

router.use(authenticateRequest);

router.post("/create-post", createNewPost);

module.exports = router;
