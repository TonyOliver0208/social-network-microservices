require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const connectToDb = require("./database/db");
const { globalErrorHandler } = require("./middleware/errorHandler");
const {
  globalRateLimiter,
  sensitiveEndpointsLimiter,
} = require("./middleware/rateLimiter");
const routes = require("./routes/identity-service");

const app = express();
const PORT = process.env.PORT || 3001;

connectToDb();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Body request: ${req.body}`);
  next();
});

app.use(globalRateLimiter);

app.use("/api/auth", routes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service is running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `🚨 Unhandled Rejection at: ${promise}\nReason: ${reason.stack || reason}`
  );
});
