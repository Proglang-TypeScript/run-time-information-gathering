# dts-runtime

Gathers runtime information from JavaScript code. This tool is a core component of [dts-generate](https://github.com/proglang/ts-declaration-file-generator). Check our paper [Generation of TypeScript Declaration Files from
JavaScript Code](https://dl.acm.org/doi/pdf/10.1145/3475738.3480941) for more details.

## Install

```bash
$ git clone [THIS-REPO] dts-runtime
$ cd dts-runtime
$ npm i
```

### Docker

```bash
./build/build.sh
```

This will build an image called `master-mind-wp3` on your local machine.

## Usage

### Get runtime information from one JS file

This command will both instrument the JS code and then execute the instrumented code. The JSON representing the collected runtime information will be printed by stdout. Additionally, the output will be saved in a file `./output.json`

#### Command

```bash
$ npm run --silent generate -- [JS-FILE]
```

#### Example

```bash
$ npm run --silent generate -- tests/calculator/calculator.js
```

#### Docker

Run the docker container mounting your file on /tmp/file.js.

```bash
docker run -v $(pwd)/tests/calculator/calculator.js:/tmp/calculator.js master-mind-wp3 /tmp/calculator.js
```

#### Blacklisted node modules

You can specify a JSON file that contains an array of blacklisted node modules which you don't want to instrument.

```bash
$ npm run --silent generate -- tests/calculator/calculator.js ./example-blacklist.json
```

example-blacklist.json:

```json
["lodash"]
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
