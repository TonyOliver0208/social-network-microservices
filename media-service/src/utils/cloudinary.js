const cloudinary = require("../config/cloudinary");
const logger = require("./logger");

const uploadMediaToCloudinary = (buffer) => {
  logger.info("Starting Cloudinary upload...");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading to Cloudinary", error);
          reject(error);
        } else {
          logger.info("Cloudinary upload completed", result);
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Media deleted successfully from Cloudinary: ${publicId}`);
    return result;
  } catch (err) {
    logger.error("Error deleting media from cludinary", err);
    throw err;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
