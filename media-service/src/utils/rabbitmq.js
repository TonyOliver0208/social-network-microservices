const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "devcol_events";

const connectToRabbitMQ = async () => {
  if (connection && channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", err);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed, attempting to reconnect...");
      connection = null;
      channel = null;
      setTimeout(connectToRabbitMQ, 5000);
    });

    logger.info("Connected to RabbitMQ successfully!");

    return channel;
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};

const publishEvent = async (routingKey, msg) => {
  try {
    if (!channel) {
      await connectToRabbitMQ();
    }

    const success = channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(msg)),
      { persistent: false }
    );

    if (!success) {
      logger.warn(`Failed to publish event: ${routingKey}`);
      throw new Error("Failed to publish event");
    }

    logger.info(`Event published: ${routingKey}`);
  } catch (error) {
    logger.error(`Error publishing event: ${routingKey}`, error);
    throw error;
  }
};

const consumeEvent = async (routingKey, callback) => {
  try {
    if (!channel) {
      await connectToRabbitMQ();
    }

    const q = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    await channel.consume(q.queue, function (msg) {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg);
      }
    });

    logger.info(`Subscribed to event: ${routingKey}`);
  } catch (error) {
    logger.error(`Error subscribing to event: ${routingKey}`, error);
    throw error;
  }
};

process.on("SIGINT", async () => {
  if (connection) {
    await connection.close();
    logger.info("RabbitMQ connection closed");
  }
  process.exit(0);
});

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };
