const { asyncHandler, APIError } = require("../middleware/errorHandler");
const Media = require("../models/media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");
const {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} = require("../config/constants");

const uploadMedia = asyncHandler(async (req, res) => {
  logger.info("Uploading media endpoint hit", { userId: req.user.userId });

  if (!req.files || req.files.length === 0) {
    logger.error("No files provided");
    throw new APIError(
      400,
      "No files provided. Please upload at least one file."
    );
  }

  const userId = req.user.userId;
  const uploadedMedia = [];

  for (const file of req.files) {
    const { originalname, mimetype, buffer, size } = file;

    if (size > MAX_FILE_SIZE) {
      logger.error(`File ${originalname} exceeds size limit`);
      throw new APIError(400, `File ${originalname} exceeds 10MB limit`);
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(mimetype) &&
      !ALLOWED_VIDEO_TYPES.includes(mimetype)
    ) {
      logger.error(`Unsupported file type for ${originalname}: ${mimetype}`);
      throw new APIError(400, `Unsupported file type for ${originalname}`);
    }

    logger.info(`Uploading file: ${originalname}, type: ${mimetype}`);

    const cloudinaryResult = await uploadMediaToCloudinary(buffer, {
      resource_type: ALLOWED_VIDEO_TYPES.includes(mimetype) ? "video" : "image",
    });

    const media = new Media({
      publicId: cloudinaryResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryResult.secure_url,
      userId,
      resourceType: ALLOWED_VIDEO_TYPES.includes(mimetype) ? "video" : "image",
    });

    await media.save();

    uploadedMedia.push({
      mediaId: media._id,
      url: media.url,
      resourceType: media.resourceType,
    });

    logger.info(`Uploaded media: ${media._id}`);
  }

  return res.status(201).json({
    success: true,
    media: uploadedMedia,
    message: `Uploaded ${uploadedMedia.length} media file(s) successfully`,
  });
});

const getAllMedias = asyncHandler(async (req, res) => {
  logger.info("Fetching all media", { userId: req.user.userId });

  const result = await Media.find({ userId: req.user.userId }).lean();

  if (result.length === 0) {
    logger.warn("No media found for user", { userId: req.user.userId });
    throw new APIError(404, "No media found for this user");
  }

  return res.status(200).json({ success: true, media: result });
});

module.exports = { uploadMedia, getAllMedias };
