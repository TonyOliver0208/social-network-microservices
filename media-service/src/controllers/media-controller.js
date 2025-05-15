const { asyncHandler, APIError } = require("../middleware/errorHandler");
const Media = require("../models/media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = asyncHandler(async (req, res) => {
  logger.info("Uploading media endpoint hit...");

  if (!req.file) {
    logger.error("No file found. Please add a file and try again!");
    throw new APIError(400, "No file found. Please add a file and try again!");
  }

  const { originalname, mimetype, buffer } = req.file;
  const userId = req.user.userId;

  logger.info(`File details: name=${originalname}, type=${mimetype}`);
  logger.info("Uploading to cloudinary starting...");

  const cloudinaryUploadResult = await uploadMediaToCloudinary(buffer);
  logger.info(
    `Cloudinary upload successfully. Public Id: - ${cloudinaryUploadResult.public_id}`
  );

  const newlyCreatedMedia = new Media({
    publicId: cloudinaryUploadResult.public_id,
    originalName: originalname,
    mimeType: mimetype,
    url: cloudinaryUploadResult.secure_url,
    userId,
  });

  await newlyCreatedMedia.save();

  logger.info("Media upload is successfully", newlyCreatedMedia._id);

  return res.status(201).json({
    success: true,
    mediaId: newlyCreatedMedia._id,
    url: newlyCreatedMedia.url,
    message: "Media upload is successfully",
  });
});

const getAllMedias = asyncHandler(async (req, res) => {
  const result = await Media.find({ userId: req.user.userId });

  if (result.length === 0) {
    logger.warn("Cannot find any media for this user", {
      userId: req.user.userId,
      mediaList: result,
    });
    throw new APIError(404, "Cannot find any media for this user");
  }

  return res.status(200).json({ result });
});

module.exports = { uploadMedia, getAllMedias };
