const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;

const EXCHANGE_NAME = "devcol_events";

const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

    logger.info("Connected to RabbitMQ successfully!");

    return channel;
  } catch (error) {
    logger.error("Error connecting to rabbit mq", error);
  }
};

const publishEvent = async (routingKey, msg) => {
  if (!channel) {
    connectToRabbitMQ();
  }

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(msg)));
};

module.exports = { connectToRabbitMQ, publishEvent };
