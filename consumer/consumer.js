const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

processedMessage = {};

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
  }
};

const addFunctionContainer = (message) => {
  processedMessage[message.value.data.functionId] = message.value.data.functionContainer;
  console.log('Added a function container.');
};

process.on('SIGINT', () => {
  console.dir(processedMessage, { depth: null });
  process.exit();
});
