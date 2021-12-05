require('dotenv').config();

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || '';
const KAFKA_BROKER = process.env.KAFKA_BROKER || '';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || '';

module.exports = {
  KAFKA_TOPIC,
  KAFKA_BROKER,
  KAFKA_CLIENT_ID,
};
