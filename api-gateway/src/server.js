require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const logger = require("./utils/logger");
const { rateLimiter } = require("./middleware/rateLimiter");
const identityServiceProxy = require("./proxies/identityService");
const globalErrorHandler = require("./middleware/errorHandler");
const postServiceProxy = require("./proxies/postService");
const validateToken = require("./middleware/authMiddleware");
const mediaServiceProxy = require("./proxies/mediaService");
const searchServiceProxy = require("./proxies/searchService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: `, JSON.stringify(req.body));

  next();
});

app.use(rateLimiter);

app.use("/v1/auth", identityServiceProxy);
app.use("/v1/post", validateToken, postServiceProxy);
app.use("/v1/media", validateToken, mediaServiceProxy);
app.use("/v1/search", validateToken, searchServiceProxy);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`API gateway is running on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(
    `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
  );
  logger.info(`Redis Url ${process.env.REDIS_URL}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `🚨 Unhandled Rejection at: ${promise}\nReason: ${reason.stack || reason}`
  );
});
