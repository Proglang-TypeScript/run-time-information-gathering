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

var processedMessage = {};
const argumentContainerDictionary = {};
const fileDictionary = {};
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
  const outputId = message.value.outputId.split('/').slice(-2).join('/');
  if (fileDictionary[outputId]) {
    processedMessage = fileDictionary[outputId];
  }
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
  var collator = new Intl.Collator(undefined, {numeric: true});
  const sortedMessage = Object.keys(processedMessage).sort(collator.compare).reduce((dict, key) => (dict[key] = processedMessage[key], dict), {});
  fileDictionary[outputId] = sortedMessage;
  writeOutFile(fileDictionary[outputId], 'test-results/'+outputId.split('.').slice(0,-1).join('.')+'-output-consumer.json');
  processedMessage = {};
};

const addFunctionContainer = (message) => {
  processedMessage[message.value.data.functionId] = message.value.data.functionContainer;
  for (const argId in message.value.data.functionContainer.args) {
    argumentContainerDictionary[message.value.data.functionContainer.args[argId].argumentId] = message.value.data.functionContainer.args[argId];
  }
};

const addArgumentContainer = (message) => {
  const functionId = message.value.data.functionId;
  if (processedMessage[functionId]) {
    processedMessage[functionId].args[message.value.data.argumentIndex] = message.value.data.argumentContainer;
  }
  argumentContainerDictionary[message.value.data.argumentContainer.argumentId] = message.value.data.argumentContainer;
};

const addInteractionArgumentContainer = (message) => {
  const argumentContainer = argumentContainerDictionary[message.value.data.argumentId];
  if (argumentContainer) {
    const interactionIds = new Set(argumentContainer.interactions.map(interaction => interaction.interactionId));
    if (!interactionIds.has(message.value.data.interaction.interactionId)) {
      argumentContainer.interactions.push(message.value.data.interaction);
    }  
  }
};

const writeOutFile = (data, fileName) => {
  out = JSON.stringify(data, null, 4);
  fs.writeFileSync(fileName, out);
  fs.writeFileSync(outputFileName, out);
};

//UPDATE FILES WHEN SHUTTING OFF CONSUMER
process.on('SIGINT', () => {
  for (outputId of Object.keys(fileDictionary)) {
    writeOutFile(fileDictionary[outputId], 'test-results/'+outputId.split('.').slice(0,-1).join('.')+'-output-consumer.json');
  }
  process.exit();
});
