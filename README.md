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

#---------------------
# Testing and Consumer Upgrades
## Usage

Please be sure to follow setup instructions above before beginning any following instructions.

### Set Up
First, local output files must be created for the tests. This is a one-time process.

```bash
node create-files.js
```

Once the consumer and docker containers are properly set up, turn on kafka from the docker.

```bash
docker-compose up
```

This can be turned off by using 'Ctrl+C'. To fulling clear out docker, execute the following command before repeating the previous command. This may be useful if a problematic test is encountered.

```bash
docker-compose down -v
```

### Single Comparisons

Once Kafka is running, the user can execute commands to run individual tests by first turning on the consumer. Be sure to confirm that `KAFKA_ENABLED=true` is set in `.env`. This is done in the same way as described above.

```bash
npm run --silent generate -- tests/calculator/calculator.js blacklisted.json
```

However, the user now has the ability to compare the outputs of this test in one of two ways. The first option looks at the individual output files from our test.

```bash
node compare.js calculator/calculator
```

The second option compares the files `output.json` with `output-consumer.json` and can be used regardless of which file was tested.

```bash
node compare.js output
```

### Multiple Comparisons

Additionally, one can now tests multiple files at once by creating a file listing tests and executing the following command. This example tests all local tests found in the directory `tests`.

```bash
node runAndCompare.js local-tests.txt
```

Running more complicated tests requires two things: a list of all the files to be tested and actual test files located in the appropriate location. Files containing a list of tests has one test file per line, seperated by ','. Optional information may come after after ',' including the term 'NOK' which will cause the line to always be skipped -- see local-tests.txt. Note that the actual test files require all const values be changed to var. 
There is an example file for non-local tests called `test-files.txt`. Before this is run, one must set up the companion repository [dts-runtime-test-files](https://github.com/Proglang-TypeScript/dts-runtime-eric-peairs-test-files/tree/main). Note, `dts-runtime-test-files` and this repository must be contained within the same parent directory. Once `dts-runtime-test-files` is set up, enter into the console the following command. (Note that the test opener/opener_1 opens a new tab in a web browser)

```bash
node runAndCompare.js test-files.txt
```

One can also run an even more thorough file from the `dts-runtime-test-files` repository itself.

```bash
node runAndCompare.js ../test-files/import-files.txt
```

It should be noted there are two files, `failed.txt` and `problem-tests.txt` that are currently used to track failing and problematic tests, respectively, for this repo. Any test listed in either file is skipped during testing as they cause the program to fail. These problems should be fixed in future work.

Results of the processes can be found in the file `test-results.txt`.

All test runs can also be run with '2>&1 | tee runAndCompare.log' to log all console information into `runAndCompare.log`.

```bash
node runAndCompare.js local-tests.txt 2>&1 | tee runAndCompare.log
```

## Results

The results from the program can be one of the following outcomes: SAME (pass - `[TESTNAME]-output.json` and `[TESTNAME]-output-consumer.json` in the test-results directory are the same), DIFFERENT (failed comparison - the two files are not the same), COMPARE FAIL (json calls on `[TESTNAME]-output.json` fail, usually due to file containing only a failure message and no json object), COMPARE CONSUMER FAIL (json calls on `[TESTNAME]-output-consumer.json` fail, the output is empty), NEW FAIL (console command fails to execute with previously unmarked test), PROBLEM TEST (console command fails to execute test previously known to fail, including bugs that require a kafka restart).

Tests with results PROBLEM TEST and NEW FAIL appear before other test results types in `test-results.txt`.

The most testing was done on `test-files.txt`. Currently there are only 4 DIFFERENT results from these tests:
•	App-module-path_6: Consumer not containing as many “array” and “string” blocks in returnTypeOfs array. 2500 missing line difference. Many usedAsArgument and operator interactions missing as well.
•	Find-parent-dir_1: A few returnTypeOfs missing (mainly “undefined” and some “string”). Some interactions (e.g. input value in function 11) missing. 100 missing line difference.
•	Statsd-client_1: Consumer output is significantly longer than normal output (3x more lines), with many additional functions. ArgumentId values not matching at all. No messages are produced in individual testing, `output-consumer.json` unchanged similar to COMPARE CONSUMER FAIL outputs.
•	Steed_302: Missing “undefined” blocks in returnTypeOfs array (function 9), a number block (function 63); missing inputValue interactions (function 65); missing inputValue and usedAsArgument interactions as well as another undefined block in returnTypeOfs (function 67, all with traceId 214). 49 missing line difference. DIFFERENT result cannot always be replicated. 

Previously, 1 additional DIFFERENT results were observed. It is unclear why they have changed:
•	Tableify_1: was a previous DIFFERENT result but cannot be replicated. Is SAME in subsequent tests.


All tests with result COMPARE CONSUMER FAIL have an empty `[TESTNAME]-output-consumer.json`. This is because no messages are produced for any of these tests. It appears that there are various errors, most commonly ReferenceErrors where something cannot be accessed before initialization (e.g. 'processOk', 'leading', 'r'). Rarely, there is a TypeError instead ("Constructor is not a constructor" for html-entities). These are similar to bugs seen for other failed tests. 
Furthermore, no messages are produced as runTimeInfo is empty yet functionIdHandler is not. Therefore, analysis believes there is a function when there is only an Id and no message is produced. Further investigation is required.


A breakdown of the results obtained from `test-files.txt` gives the following outputs:
PROBLEM TEST: 7.6% (42/554)
COMPARE FAIL: 24.4% (135/554)
COMPARE CONSUMER FAIL: 2.5% (14/554)
DIFFERENT: 0.7% (4/554)
SAME: 64.8% (359/554)

SAME/(SAME+DIFFERENT) = 98.9% success rate when analysis has no bugs or errors

Currently, the time it takes to complete testing of `test-files.txt` is roughly 20 minutes. This is a significant increase in speed over previous tests of 6.5 hours (1950% faster). This is mainly thanks to improvement to the consumer, thus avoiding repeatedly restarting it and saving about 45 seconds each restart.


## Summary of New Features

The first new feature is a new message from `argumentContainer.js`. The main issue why local tests were failing was because the consumer outputs were missing some interactions. Therefore, messages must be sent for each interaction occuring and this is done from `argumentContainer.js`. In order to match these interactions with the correct argument, a unique ID (nanoid) is used for each argument from `argumentContainer.js` as argumentId in the value, while each interaction message includes this same ID value as an additional message parameter. Since this is the same file from where interaction messages are sent, they can include the same unique ID values as the arguments.

Within the container, a new message command type has been added to the switch for interactions, called addInteractionArgumentContainer as well as a dictionary created called argumentContainerDictionary in order to add the interactions to the output. This dictionary has keys of the unique IDs of the arguments and values of the argumentContainers themselves. Key-value pairs are added to the dictionary for every funcation and argument message received. When an interaction message is received, the unique ID is used to find the value in the dictionary. Since the dictionary value is the same object that is output from the consumer, adding the interaction to the interaciton array within the dictionary is sufficient for including all interactions in the output.

At this point, all local tests were passing successfully using a basic comparison file. However, the testing process was slow and tedious and thus addional changes were added to significantly speed up the process.

One significant addition is the inclusion of a sorter object, Collator, in both `consumer.js` and `analysis.js`. This alphanumeric sorter is used to force functions, arguments, and interactions to be in the same order in both outputs. In `consumer.js`, the Collator sorts the keys of the processMessage and creates a new message, sortedMessage, while keeping the values the same. In `analysis.js`, sandbox.runTimeInfo is sorted in the same way.

However, `consumer.js` could not previously distinguish messages from different tests and would include all messages it received in a single output. This meant the consumer was regularly shut off and restarted for each test. Therefore, a second dictionary was added to the `consumer.js`, fileDictionary, that contains the current output messages for all tests. The processMessage is set to a value in fileDiciontary before the value of the received message is incorporated. The result is then sorted and the new sortedMessage becomes the new value in fileDiciontary.

The new dictionary also requires a key. Kafka now produces all messages with a new parameter, outputId, that represents the current file (process.argv[1]). Since outputId is unique for each file it can prevent messages from different test files from interacting with each other.

With multiple outputs being saved, `consumer.js` must now write the information to mutliple output-consumer.json files. First, all necessary files are created using a one-time use file, `create-files.js`. Next, the function writeOutFile is adjusted to take in a file name as an input. By calling this function with the appropriate file name (key in fileDictionary), the consumer now writes to the appropriate file after each message received as well as when the consumer is turned off. In addition, the previous writing to `output-consumer.json` remains, allowing the user to continue to test only one file at a time.

In order to compare the two output files, a comparison file was created called `compare.js`. Sometimes `output.json` includes additional information at the beginning of the file before the json output, requiring the beginning lines to be spliced out along the first '{\n'. This removes anything occuring before the first open bracket with the exeption of error messages informing the using the output has failed.

`compare.js` works for one comparison at a time. Both the consumer output and the modified ouput are stringified from JSONs and compared, using try-catch statements in case the json files are not proper json objects. Compare then writes to `test-results.txt` and prints the result or bug caught from the test.

Finally, `runAndCompare.js` was created to run multiple tests and comparisons. Here, the user must enter a valid file they would like to use as their list for tests. The consumer is turned on and the program waits 60 seconds (the consumer takes 30-45 seconds to start). Tests marked as NOK (not OK), found in `problem-tests.txt`, or found in `failed.txt` are skipped before npm is generated. If this fails it is caught and added to `failed.txt`. The result `output.json` is written to the appropriate individual output file `[TESTNAME]-output.json`. The consumer is then turned off. Finally, a loop is run comparing the valid tests using `compare.js`.

## Diagram
![alt text](./main-architecture.png?raw=true)
![alt text](./compare-architecture.png?raw=true)