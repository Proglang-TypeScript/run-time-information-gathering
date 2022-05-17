require('dotenv').config();

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || '';
const KAFKA_HOST = process.env.KAFKA_HOST || '';
const KAFKA_PORT = process.env.KAFKA_PORT || '';
const KAFKA_BROKER = `${KAFKA_HOST}:${KAFKA_PORT}`;
const KAFKA_CLIENT_ID_PRODUCER = process.env.KAFKA_CLIENT_ID_PRODUCER || '';
const KAFKA_CLIENT_ID_CONSUMER = process.env.KAFKA_CLIENT_ID_CONSUMER || '';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || '';

module.exports = {
  KAFKA_TOPIC,
  KAFKA_BROKER,
  KAFKA_CLIENT_ID_PRODUCER,
  KAFKA_CLIENT_ID_CONSUMER,
  KAFKA_GROUP_ID,
};
