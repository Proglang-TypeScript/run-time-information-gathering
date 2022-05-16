# dts-runtime-asynchronous

This is an asynchronous implementation of [dts-runtime](https://github.com/proglang/run-time-information-gathering). Implements a Message Queue via KafkaJS to send, receive and store the data, produced by dts-runtime.

## Install

```bash
$ git clone [THIS-REPO] dts-runtime
$ cd dts-runtime
$ npm i
$ npm install kafkajs
```

### Docker

```bash
./build/build.sh
```

This will build an image called `master-mind-wp3` on your local machine.

## Usage

### Get runtime information from one JS file

This command will both instrument the JS code and then execute the instrumented code. The JSON representing the collected runtime information will be printed by stdout. Additionally, the output will be saved in a file `./output.json`. The Message Queue output will be saved in a file `./output-consumer.json`. Also the consumer will print the output on key interrupt (CTRL + C).

#### docker-compose

Run the docker container.

```bash
$ docker-compose up -d
```

#### Starting the consumer

Split the terminal into (A) and (B).
(A):

```bash
$ npm run start:consumer
```

#### Command

(B):

```bash
$ npm run --silent generate -- [JS-FILE] blacklisted.json
```

#### Example

(B):

```bash
$ npm run --silent generate -- tests/calculator/calculator.js blacklisted.json
```

#### Docker

Run the docker container mounting your file on /tmp/file.js.

```bash
docker run -v $(pwd)/tests/calculator/calculator.js:/tmp/calculator.js master-mind-wp3 /tmp/calculator.js
```

#### Blacklisted node modules

You can specify a JSON file that contains an array of blacklisted node modules which you don't want to instrument. For the asynchronous implementation to work, this needs to contain 'kafkajs'.

```bash
$ npm run --silent generate -- tests/calculator/calculator.js ./example-blacklist.json
```

example-blacklist.json:

```json
["kafkajs"]
```

#### Docker

```bash
docker run \
	-v $(pwd)/tests/calculator/calculator.js:/tmp/calculator.js \
	-v PATH_TO_BLACKLIST.json:/tmp/blacklist.json
	master-mind-wp3 \
	/tmp/calculator.js
	/tmp/blacklist.json
```

### Instrument a JS file

This command will only instrument the file without executing it. This scenario is useful when dealing with a large number of files which you first want to instrument and execute later.

#### Command

```bash
$ npm run --silent instrument -- [JS-FILE-TO-INSTRUMENT] [OUTPUT-DIRECTORY]
```

The instrumented code will be found under `[OUTPUT-DIRECTORY]`

#### Example

```bash
$ npm run --silent instrument -- tests/calculator/calculator.js ./instrument
```
