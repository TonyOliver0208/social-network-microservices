const cloudinary = require("../config/cloudinary");
const logger = require("./logger");

const uploadMediaToCloudinary = (buffer, options = {}) => {
  logger.info("Starting Cloudinary upload...");
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...options,
          folder: "media",
          resource_type: options.resource_type || "auto",
        },
        (error, result) => {
          if (error) {
            logger.error("Error while uploading to Cloudinary", error);
            reject(error);
          } else {
            if (
              options.resource_type === "video" &&
              result.duration > MAX_VIDEO_DURATION
            ) {
              logger.error(
                `Video duration exceeds ${MAX_VIDEO_DURATION} seconds`
              );
              reject(
                new Error(
                  `Video duration exceeds ${MAX_VIDEO_DURATION} seconds`
                )
              );
            }
            logger.info("Cloudinary upload completed", result);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    logger.error("Cloudinary upload failed", error);
    throw error;
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Media deleted successfully from Cloudinary: ${publicId}`);
    return result;
  } catch (err) {
    logger.error(`Failed to delete media from Cloudinary: ${publicId}`, err);
    throw err;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
