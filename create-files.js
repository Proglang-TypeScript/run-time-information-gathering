const fs = require('fs');
const execSync = require('child_process').execSync;
var tests = fs.readFileSync('../test-files/import-files.txt', 'utf-8').split('\n');
var testsLocal = fs.readFileSync('./local-tests.txt', 'utf-8').split(',\n');
var i = 1;

const createFiles = (test, size) => {
    if (test) {
        console.log(test + ' ' + i + '/' + size);
        if (!test.includes("NOK")) {
            test = test.split(',')[0];
            try {
                const fileName = test.split('.')[0];
                const folderpath = test.split('/')[0];
                execSync('mkdir test-results/' + folderpath);
                const updateTest = execSync('cat > test-results/' + fileName + '-output-consumer.json');
                const output = execSync('cat > test-results/'+ fileName + '-output.json');
            }
            catch {
                continue;
            }
        }
    }
}


execSync('mkdir test-results');
for (test of tests) {
    createFiles(test, tests.length);
    i++;
}
i = 1;
for (test of testsLocal) {
    createFiles(test, testsLocal.length);
    i++;
}