const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connect to Mongo successfully");
  } catch (err) {
    logger.error(`Failed connect to MongoDb: ${err}`);
    process.exit(1);
  }
};

module.exports = connectToDb;
