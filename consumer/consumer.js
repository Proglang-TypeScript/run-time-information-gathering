const { Kafka } = require('kafkajs');
var fs = require('fs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

var processedMessage = {};

const consumeMessages = async () => {
  const consumer = kafka.consumer({ groupId: 'test-group' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'topicTest.v1' });

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
};

const addFunctionContainer = (message) => {
  processedMessage[message.value.data.functionId] = message.value.data.functionContainer;
};

const addArgumentContainer = (message) => {
  argumentIndex = message.value.data.argumentIndex;
  functionId = message.value.data.functionId;
  // processedMessage[functionId].args[argumentIndex] = message.value.data.argumentContainer;
  console.log(processedMessage[functionId]);
  console.log(argumentIndex);
  console.log(functionId);
};

const writeOutFile = (data) => {
  out = JSON.stringify(data, null, 4);
  fs.writeFile('out.JSON', out, (err) => {
    if (err) console.error(err);
  });
};

process.on('SIGINT', () => {
  out = JSON.stringify(processedMessage, null, 4);
  fs.writeFileSync('out.JSON', out);
  console.log(processedMessage.functionId_3.args);
  // console.dir(processedMessage, { depth: null});
  process.exit();
});
