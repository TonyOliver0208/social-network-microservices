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

const consumeEvent = async (routingKey, callback) => {
  if (!channel) {
    connectToRabbitMQ();
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
};

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };
