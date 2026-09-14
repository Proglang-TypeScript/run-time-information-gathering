const { Kafka } = require('kafkajs');
const { nanoid } = require('nanoid');
const { KAFKA_BROKER, KAFKA_TOPIC, KAFKA_CLIENT_ID_PRODUCER, KAFKA_ENABLED } = require('./config');

const kafka = KAFKA_ENABLED
  ? new Kafka({
      clientId: KAFKA_CLIENT_ID_PRODUCER,
      brokers: [KAFKA_BROKER],
    })
  : null;

const producer = kafka ? kafka.producer() : null;

const produceMessage = async (message) => {
  if (!KAFKA_ENABLED) {
    return;
  }

  await producer.connect();
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      {
        value: JSON.stringify({
          ...message,
          id: nanoid(),
          timestamp: new Date().toISOString(),
          outputId: process.argv[1],
        }),
      },
    ],
  });
  await producer.disconnect();
};

module.exports = {
  produceMessage,
};
