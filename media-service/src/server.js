require("dotenv").config();
const express = require("express");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const connectToDb = require("./database/db");
const mediaRoutes = require("./routes/media-routes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handler");

const app = express();
const PORT = process.env.PORT || 3003;

connectToDb();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Body request: ${JSON.stringify(req.body)}`);

  next();
});

app.use("/api/media", mediaRoutes);

app.use(globalErrorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media service is listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to server", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `🚨 Unhandled Rejection at: ${promise}\nReason: ${reason.stack || reason}`
  );
});
