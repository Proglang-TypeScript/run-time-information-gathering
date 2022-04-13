const { Kafka } = require('kafkajs');
var fs = require('fs');
const {
  KAFKA_BROKER,
  KAFKA_TOPIC,
  KAFKA_CLIENT_ID,
  KAFKA_CLIENT_ID_CONSUMER,
  KAFKA_GROUP_ID,
} = require('../utils/config');

const kafka = new Kafka({
  // kafka clientId
  clientId: KAFKA_CLIENT_ID_CONSUMER,
  brokers: ['localhost:9092'],
});

const processedMessage = {};
var messageChanged = false;
var out = '';
const outputFileName = 'output-consumer.JSON';

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPIC });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      message.value = JSON.parse(message.value.toString());
      runCommand(message);
    },
  });
};

(async () => {
  await consumeMessages();
})();

const runCommand = (message) => {
  switch (message.value.command) {
    case 'add-function-container':
      addFunctionContainer(message);
      break;
    case 'add-argument-container':
      addArgumentContainer(message);
      break;
  }
  writeOutFile(processedMessage);
  messageChanged = true;
};

const addFunctionContainer = (message) => {
  processedMessage[message.value.data.functionId] = message.value.data.functionContainer;
};

const addArgumentContainer = (message) => {
  const argumentIndex = message.value.data.argumentIndex;
  const functionId = message.value.data.functionId;
  if (processedMessage[functionId]) {
    processedMessage[functionId].args[argumentIndex] = message.value.data.argumentContainer;
  }
};

const writeOutFile = (data) => {
  out = JSON.stringify(data, null, 4);
  fs.writeFile(outputFileName, out, (err) => {
    if (err) console.error(err);
  });
};

setInterval(function () {
  if (messageChanged) {
    writeOutFile(processedMessage);
    messageChanged = false;
  }
}, 2000);

process.on('SIGINT', () => {
  out = JSON.stringify(processedMessage, null, 4);
  fs.writeFileSync(outputFileName, out);
  console.log(out);
  process.exit();
});
