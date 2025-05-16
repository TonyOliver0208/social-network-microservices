const express = require("express");
const multer = require("multer");
const authenticateRequest = require("../middleware/authMiddleware");
const logger = require("../utils/logger");
const {
  uploadMedia,
  getAllMedias,
} = require("../controllers/media-controller");
const rateLimiter = require("../middleware/rateLimiter");
const { MAX_FILE_SIZE } = require("../config/constants");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).array("files");

router.use(authenticateRequest);

router.post("/upload", rateLimiter, upload, uploadMedia);
router.get("/get", getAllMedias);

module.exports = router;
