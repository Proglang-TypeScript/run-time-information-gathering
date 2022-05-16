require('dotenv').config();

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || '';
const KAFKA_BROKER = process.env.KAFKA_BROKER || '';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || '';
const KAFKA_CLIENT_ID_PRODUCER = process.env.KAFKA_CLIENT_ID_PRODUCER || '';
const KAFKA_CLIENT_ID_CONSUMER = process.env.KAFKA_CLIENT_ID_CONSUMER || '';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || '';

module.exports = {
  KAFKA_TOPIC,
  KAFKA_BROKER,
  KAFKA_CLIENT_ID,
  KAFKA_CLIENT_ID_PRODUCER,
  KAFKA_CLIENT_ID_CONSUMER,
  KAFKA_GROUP_ID,
};
