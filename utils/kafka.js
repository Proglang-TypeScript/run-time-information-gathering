const { Kafka } = require('kafkajs');
const { nanoid } = require('nanoid');
const { KAFKA_BROKER, KAFKA_TOPIC, KAFKA_CLIENT_ID } = require('./config');

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKER],
});

const produceMessage = async (message) => {
  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      { value: JSON.stringify({ ...message, id: nanoid(), timestamp: new Date().toISOString() }) },
    ],
  });

  await producer.disconnect();
};

module.exports = {
  produceMessage,
};
