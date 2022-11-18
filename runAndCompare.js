


//FILE FOR COMPARING output.json TO output-consumer.json FOR ALL TEST FILES IN TEST FOLDER

// //EXAMPLE CODE FOR DIFF.SH ON HOW TO FIND FILES, DON'T FORGET TO CHANGE DIFF.SH BACK
// SCRIPT_PATH="$( cd "$(dirname "$0")" ; pwd -P )"
// TESTS_PATH=$SCRIPT_PATH

// TEST_FILES=$(find $TESTS_PATH -type f -name "*.js" ! -name "*_jalangi_.js")

// for file in $TEST_FILES; do
// 	filename=$(basename "$file")
// 	echo "$filename"

// done




// //RUNNING BASH COMMAND OF DIFF.SH FILE (FOR NOW) IN ORDER TO GET LIST OF TEST FILES
// var tests = [];

// var exec = require('child_process').exec;

// exec('tests/diff.sh',
//     function (error, stdout, stderr) {
//         tests.push(stdout); //tests is just one big string right now
//         // console.log(tests);
//         tests.forEach(func);
//         // console.log('stdout: ' + stdout);
//         // console.log('stderr: ' + stderr);
//         if (error !== null) {
//              console.log('exec error: ' + error);
//         }
//     });


// console.log(tests);


// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });

var args = process.argv.slice(2); //only 1 argument at time since must reset Kafka each time


// PIECE FOR LOOPING THROUGH LIST OF TEST FILE NAMES
// const tests = ['tests/asynchronism/callbackAsObjectMethod'];
const tests = ['tests/asynchronism/callbackAsObjectMethod', 'tests/asynchronism/setTimeout', 'tests/asynchronism/setTimeoutChain',
    'tests/asynchronism/setTimeoutGlobalCallback', 'tests/asynchronism/setTimeoutGlobalChain', 'tests/calculator/calculator', 
    'tests/callbacks/callback-simple', 'tests/converted_to/greaterThanOperator', 'tests/converted_to/lessThanOperator',
    'tests/converted_to/sumOperator', 'tests/converted_to/sumOperatorGetProp', 'tests/enclosing-function/enclosingFunctionGetFieldReturningObject',
    'tests/enclosing-function/enclosingFunctionGlobalFunctions', 'tests/enclosing-function/enclosingFunctionObjectMethods', 
    'tests/enclosing-function/enclosingFunctions', 'tests/get_prop/getProp', 'tests/get_prop/getPropNotArgument', 'tests/get_prop/getPropReturningObject',
    'tests/get_prop/getPropSameObjectForTwoArguments', 'tests/get_prop/recursiveGetProp', 
    'tests/input_value/inputValueMethod', 'tests/input_value/inputValueMethodInsideFunction', 'tests/input_value/inputValueNotMethods',
    'tests/input_value/inputValueTypeOfs', 'tests/method_call/methodCallInsideFunction', 'tests/method_call/methodCallOffsetNonexistent',
    'tests/method_call/methodCallOutsideFunction', 'tests/method_call/methodReturningObject', 'tests/method_call/recursiveMethodCallReturningObject',
    'tests/method_returning_typeof/methodMultipleReturnTypeOfs', 'tests/method_returning_typeof/methodSimpleReturnTypeOf',
    'tests/non-instrumented-functions/fsModule', 'tests/nullAsProxy/nullAsNumber', 'tests/nullAsProxy/nullAsString', 'tests/nullAsProxy/nullConditional',
    'tests/nullAsProxy/nullEqualOperator', 'tests/numbers/numberMethodsAndProperties', 'tests/operators/operators', 'tests/set_prop/setProp',
    'tests/set_prop/setPropReturnedObject', 'tests/strings/stringMethodsAndProperties', 'tests/undefinedAsProxy/undefinedAsNumber', 
    'tests/undefinedAsProxy/undefinedAsString', 'tests/undefinedAsProxy/undefinedConditional', 'tests/undefinedAsProxy/undefinedEqualOperator',
    'tests/used_as_argument/usedAsArgument', 'tests/used_as_argument/usedAsArgumentWithTimeout'];
// args.forEach(func);


const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
var isTimeout = false;
var out = '';


// const waitSimple = (ms) => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

const wait = (fileName) => {
    return new Promise((resolve) => {
        var timer = setTimeout(function () {
            fs.unwatchFile(fileName);
            console.log("Timed out");
            isTimeout = true;
            resolve();
        }, 60000);

        fs.watchFile(fileName, function () {
            fs.unwatchFile(fileName);
            console.log("File Updated");  
            clearTimeout(timer);
            setTimeout(resolve, 500);
            // resolve();
        });
    });
};


const runTest = async () => {
    for(test of tests) {
        //CHECK THAT TEST FILE EXISTS

        tester = 'npm run --silent generate -- ' + test + ' blacklisted.json';

        // RESTART CONSUMER HERE
        var consumer = exec('npm run start:consumer');
        console.log("Consumer started");
        const output = execSync(tester);

        // await waitSimple(10000);
        await wait('output-consumer.json');

        process.kill(consumer.pid);

        //END LOOP IF WAIT TIMED OUT TO AVOID BUGS
        if (isTimeout) {
            out += test + ": Timeout\n";
            fs.writeFileSync('test-results.txt', out);
            break;
        }
       
        // CHECK IF TWO FILES ARE THE SAME       
        var file1 = fs.readFileSync('output.json');
        var file1Clean = '{' + file1.toString().split('\n{\n').slice(1).join('{');
        var file2 = fs.readFileSync('output-consumer.json');
        file1 = JSON.stringify(JSON.parse(file1Clean), null, 4);
        file2 = JSON.stringify(JSON.parse(file2.toString()), null, 4);
        if (file1 === file2) {
            out += test + ": They are the same\n";
            fs.writeFileSync('test-results.txt', out);
            console.log(test + ": They are the same");
        }
        else {
            out += test + ": They are different\n";
            fs.writeFileSync('test-results.txt', out);
            console.log(test + ": They are different");
        }

    }
    // fs.writeFileSync('test-results.txt', out);
};

runTest();

//use interval or readfile to see if output-consumer has been printed
//run one after another since not execSync for consumer (if this is fixed parallel may be possible)