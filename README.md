# dts-runtime

Gathers runtime information from JavaScript code. This tool is a core component of [dts-generate](https://github.com/proglang/ts-declaration-file-generator). Check our paper [Generation of TypeScript Declaration Files from JavaScript Code](https://dl.acm.org/doi/pdf/10.1145/3475738.3480941) for more details.

It also presents an asynchronous implementation which, implements a Message Queue via KafkaJS to send, receive and store the runtime information.

## Install

```bash
git clone [THIS-REPO] dts-runtime
cd dts-runtime
npm i
npm run env
```

## Usage

### Get runtime information from one JS file

This command will both instrument the JS code and then execute the instrumented code. The JSON representing the collected runtime information will be printed by stdout. Additionally, the output will be saved in a file `./output.json`.

```bash
npm run --silent generate -- [JS-FILE] blacklisted.json
```

#### Example

```bash
npm run --silent generate -- tests/calculator/calculator.js blacklisted.json
```

#### Consumer

The Message Queue output will be saved in a file `./output-consumer.json`. Also the consumer will print the output on key interrupt (CTRL + C).

Check your `.env` file and modify the Kafka env variables accordingly if needed. You'll have to set `KAFKA_ENABLED=true`.

Initialize Kafka:

```bash
docker-compose up -d
```

Take a look at https://github.com/proglang/kafkajs-getting-started for more details about the `docker-compose.yml` file.

Start the consumer:

```bash
npm run start:consumer
```

#### Blacklisted node modules

You can specify a JSON file that contains an array of blacklisted node modules which you don't want to instrument. For the asynchronous implementation to work, this needs to contain 'kafkajs'.

```bash
npm run --silent generate -- tests/calculator/calculator.js ./example-blacklist.json
```

example-blacklist.json:

```json
["kafkajs"]
```

### Instrument a JS file

This command will only instrument the file without executing it. This scenario is useful when dealing with a large number of files which you first want to instrument and execute later.

#### Command

```bash
npm run --silent instrument -- [JS-FILE-TO-INSTRUMENT] [OUTPUT-DIRECTORY]
```

The instrumented code will be found under `[OUTPUT-DIRECTORY]`

#### Example

```bash
npm run --silent instrument -- tests/calculator/calculator.js ./instrument
```

### Docker

```bash
./build/build.sh
```

This will build an image called `master-mind-wp3` on your local machine.

#### Generate runtime information

Run the docker container mounting your file on /tmp/file.js.

```bash
docker run -v $(pwd)/tests/calculator/calculator.js:/tmp/calculator.js master-mind-wp3 /tmp/calculator.js
```

#### Blacklist

```bash
docker run \
	-v $(pwd)/tests/calculator/calculator.js:/tmp/calculator.js \
	-v PATH_TO_BLACKLIST.json:/tmp/blacklist.json
	master-mind-wp3 \
	/tmp/calculator.js
	/tmp/blacklist.json
```
