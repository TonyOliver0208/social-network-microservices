const Media = require("../models/media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  const { postId, mediaIds } = event;
  try {
    if (!mediaIds || mediaIds.length === 0) {
      logger.info(`No media to delete for post ${postId}`);
      return;
    }

    const mediasToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediasToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Deleted media ${media._id} associated with this deleted post ${postId}`
      );
    }

    logger.info(
      `Processed deletion of ${mediasToDelete.length} media for post ${postId}`
    );
  } catch (error) {
    logger.error(`Error deleting media for post ${postId}`, error);
    throw error;
  }
};

module.exports = { handlePostDeleted };
