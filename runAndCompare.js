const fs = require('fs');


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

// function func(value) {
//     // tester = 'npm run --silent generate -- tests/' + value + '.js blacklisted.json';
//     console.log(value);
// }

// process.argv.forEach(function (val, index, array) {
//     console.log(index + ': ' + val);
// });

var args = process.argv.slice(2); //only 1 argument at time since must reset Kafka each time


// PIECE FOR LOOPING THROUGH LIST OF TEST FILE NAMES
// const tests = ['tests/asynchronism/callbackAsObjectMethod'];
const tests = ['tests/asynchronism/callbackAsObjectMethod', 'tests/asynchronism/setTimeout', 'tests/asynchronism/setTimeoutChain',
//     'asynchronism/setTimeoutGlobalCallback', 'asynchronism/setTimeoutGlobalChain', 'calculator/calculator', 
//     'callbacks/callback-simple', 'converted_to/greaterThanOperator', 'converted_to/lessThanOperator',
//     'converted_to/sumOperator', 'converted_to/sumOperatorGetProp', 'enclosing-function/enclosingFunctionGetFieldReturningObject',
//     'enclosing-function/enclosingFunctionGlobalFunctions', 'enclosing-function/enclosingFunctionObjectMethods', 
//     'enclosing-function/enclosingFunctions', 'get_prop/getProp', 'get_prop/getPropNotArgument', 'get_prop/getPropReturningObject',
//     'get_prop/getPropSameObjectForTwoArguments', 'get_prop/recursiveGetProp', 
//     'input_value/inputValueMethod', 'input_value/inputValueMethodInsideFunction', 'input_value/inputValueNotMethods',
//     'input_value/inputValueTypeOfs', 'method_call/methodCallInsideFunction', 'method_call/methodCallOffsetNonexistent',
//     'method_call/methodCallOutsideFunction', 'method_call/methodReturningObject', 'method_call/recursiveMethodCallReturningObject',
//     'method_returning_typeof/methodMultipleReturnTypeOfs', 'method_returning_typeof/methodSimpleReturnTypeOf',
//     'non-instrumented-functions/fsModule', 'nullAsProxy/nullAsNumber', 'nullAsProxy/nullAsString', 'nullAsProxy/nullConditional',
//     'nullAsProxy/nullEqualOperator', 'numbers/numberMethodsAndProperties', 'operators/operators', 'set_prop/setProp',
//     'set_prop/setPropReturnedObject', 'strings/stringMethodsAndProperties', 'undefinedAsProxy/undefinedAsNumber', 
//     'undefinedAsProxy/undefinedAsString', 'undefinedAsProxy/undefinedConditional', 'undefinedAsProxy/undefinedEqualOperator',
    'tests/used_as_argument/usedAsArgument', 'tests/used_as_argument/usedAsArgumentWithTimeout'];
// args.forEach(func);
// tests.forEach(func);

// function func(value) {
//     tester = 'npm run --silent generate -- ' + value + ' blacklisted.json';
//     // console.log(tester);

//     // // RESTART CONSUMER HERE
//     const exec = require('child_process').exec;
//     const execSync = require('child_process').execSync; // import { execSync } from 'child_process' 
//     var consumer = exec('npm run start:consumer');
//     console.log("Consumer started");

//     setTimeout(function(){
//         // //RUN COMMAND FOR A FILE, WILL LATER GO INSIDE LOOP
           
//         const output = execSync(tester, { encoding: 'utf-8' }); // the default is 'buffer'
        
//         // //CHECK IF TWO FILES ARE THE SAME
//         var fs = require('fs'); 
//         var file1 = fs.readFileSync('output.json');
//         var file1Clean = '{' + file1.toString().split('\n{\n').slice(1).join('{');
//         var file2 = fs.readFileSync('output-consumer.json');
//         file1 = JSON.stringify(JSON.parse(file1Clean), null, 4);
//         file2 = JSON.stringify(JSON.parse(file2.toString()), null, 4);
//         if (file1 === file2) {
//             console.log(value + ": They are the same");
//         }
//         else {
//             console.log(value + ": They are different");
//         }
//         process.kill(consumer.pid);
//     }, 45000);
// }

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
        }, 45000);

        fs.watchFile(fileName, function () {
            fs.unwatchFile(fileName);
            console.log("File Updated");  
            clearTimeout(timer);
            resolve();
        });
    });
};


const runTest = async () => {
    for(test of tests) {
        tester = 'npm run --silent generate -- ' + test + ' blacklisted.json';

        // RESTART CONSUMER HERE
        var consumer = exec('npm run start:consumer');
        console.log("Consumer started");
        const output = execSync(tester);

        // await waitSimple(10000);
        await wait('output-consumer.json');

        process.kill(consumer.pid);

        //KILL LOOP IF WAIT TIMES OUT
        if (isTimeout) {
            out += test + ": Timeout\n";
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
            // fs.writeFileSync('test-results.txt', out);
            console.log(test + ": They are the same");
        }
        else {
            out += test + ": They are different\n";
            
            console.log(test + ": They are different");
        }

    }
    fs.writeFileSync('test-results.txt', out);
};

runTest();

//use interval or readfile to see if output-consumer has been printed
//run one after another since not execSync for consumer (if this is fixed parallel may be possible)