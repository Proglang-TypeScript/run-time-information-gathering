const { Kafka } = require('kafkajs');
var fs = require('fs');
const {
  KAFKA_BROKER,
  KAFKA_TOPIC,
  KAFKA_CLIENT_ID_CONSUMER,
  KAFKA_GROUP_ID,
} = require('../utils/config');

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID_CONSUMER,
  brokers: [KAFKA_BROKER],
});

const processedMessage = {};
const argumentContainerDictionary = {};
var messageChanged = false;
var out = '';
const outputFileName = 'output-consumer.json';

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPIC });

  await consumer.run({
    eachMessage: async ({ message }) => {
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
    case 'add-interaction':
      addInteractionArgumentContainer(message);
      break;
  }
  writeOutFile(processedMessage);
  messageChanged = true;
};

const addFunctionContainer = (message) => {
  processedMessage[message.value.data.functionId] = message.value.data.functionContainer;
  for (const argId in message.value.data.functionContainer.args) {
    argumentContainerDictionary[message.value.data.functionContainer.args[argId].argumentId] = message.value.data.functionContainer.args[argId];
  }
};

const addArgumentContainer = (message) => {
  const argumentIndex = message.value.data.argumentIndex;
  const functionId = message.value.data.functionId;
  if (processedMessage[functionId]) {
    processedMessage[functionId].args[argumentIndex] = message.value.data.argumentContainer;
  }
  argumentContainerDictionary[message.value.data.argumentContainer.argumentId] = message.value.data.argumentContainer;
};

const addInteractionArgumentContainer = (message) => {
  const argumentId = message.value.data.argumentId;
  const argumentContainer = argumentContainerDictionary[argumentId];
  if (argumentContainer) {
    const interactionIds = new Set(argumentContainer.interactions.map(interaction => interaction.interactionId));
    if (!interactionIds.has(message.value.data.interaction.interactionId)) {
      argumentContainer.interactions.push(message.value.data.interaction);
    }  
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
  // console.log(out);
  process.exit();
});
