const express = require("express");
const multer = require("multer");
const authenticateRequest = require("../middleware/authMiddleware");
const logger = require("../utils/logger");
const {
  uploadMedia,
  getAllMedias,
} = require("../controllers/media-controller");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

router.use(authenticateRequest);

router.post("/upload", rateLimiter, upload, uploadMedia);
router.get("/get", getAllMedias);

module.exports = router;
