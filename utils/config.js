require('dotenv').config();

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || '';
const KAFKA_BROKER = process.env.KAFKA_BROKER || '';

module.exports = {
  KAFKA_TOPIC,
  KAFKA_BROKER,
};
