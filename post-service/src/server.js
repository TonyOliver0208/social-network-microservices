require("dotenv").config();
const express = require("express");
const connectToDb = require("./database/db");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const { globalErrorHandler } = require("./middleware/errorHandler");
const postRoutes = require("./routes/post-routes");
const rateLimiter = require("./middleware/rateLimiter");
const redisClient = require("./utils/redis");

const app = express();
const PORT = process.env.PORT || 3002;

connectToDb();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Body request: ${req.body}`);
  next();
});

app.use(rateLimiter);

app.use(
  "/api/post",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`Post service is running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `🚨 Unhandled Rejection at: ${promise}\nReason: ${reason.stack || reason}`
  );
});
