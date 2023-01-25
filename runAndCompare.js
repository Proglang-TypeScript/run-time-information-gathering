const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const file = process.argv[2];
try {
    var getTests = fs.readFileSync(file, 'utf-8').split('\n');
}
catch {
    console.log("File '" + file + "' not found. Please enter a valid file");
}
var getProblems = fs.readFileSync('problem-tests.txt', 'utf-8');
var getFailed = fs.readFileSync('failed.txt', 'utf-8');
var out = '';


const waitSimple = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const runTest = async () => {
    var consumer = exec('npm run start:consumer');
    await waitSimple(60000);
    console.log("Consumer started");
    fs.writeFileSync('test-results.txt', out);
    for (test of getTests) {
        if (!test || test.includes("NOK")) {
            continue;
        }
        test = test.split(',')[0];
        const printTest = test.split('/').slice(-2).join('/').split('.').slice(0,-1).join('.');
        if (getProblems.includes(test) || getFailed.includes(test)) {
            out = printTest + ", PROBLEM TEST\n";
            fs.appendFileSync('test-results.txt', out);
            console.log(out);
            continue;
        }
        
        tester = 'npm run --silent generate -- ' + test + ' blacklisted.json';
        console.log("TESTING: " + test);
        try {
            const output = execSync(tester);
        } catch(error) {
            out = printTest + ", NEW FAIL\n";
            fs.appendFileSync('test-results.txt', out);
            fs.appendFileSync('failed.txt', test + '\n');
            console.log(out);
            continue;
        }

        var file1 = fs.readFileSync('output.json');
        fs.writeFileSync('test-results/' + printTest + '-output.json', file1);
    }
    process.kill(consumer.pid);
    
    //COMPARING FILES
    for (test of getTests) {
        if (!test || test.includes("NOK")) {
            continue;
        }
        test = test.split('/').slice(-2).join('/').split(',')[0].split('.').slice(0,-1).join('.');
        if (fs.readFileSync('test-results.txt', 'utf-8').includes(test+',')) {
            continue;
        }
        const compare = execSync('node compare.js ' + test);
        console.log(test + ', ' + compare);
    }
};

if (getTests) {
    console.log("Beginning test");
    runTest();
}