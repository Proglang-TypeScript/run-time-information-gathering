var fs = require('fs'); 
var file = process.argv[2];
var failedTest = false;

if (file == 'output') {
    var file1 = fs.readFileSync(file + '.json');
    var file2 = fs.readFileSync(file + '-consumer.json');
}
else {
    var file1 = fs.readFileSync('test-results/' + file + '-output.json');
    var file2 = fs.readFileSync('test-results/' + file + '-output-consumer.json');
}
file1 = '{\n' + file1.toString().split('\n{\n').slice(1).join('\n{\n');

try {
    file1 = JSON.stringify(JSON.parse(file1.toString()), null, 4);
}
catch {  
    out = file + ": COMPARE FAIL\n";
    fs.appendFileSync('test-results.txt', out);
    failedTest = true;
    console.log("COMPARE FAIL");
}

if (!failedTest) {
    try {
        file2 = JSON.stringify(JSON.parse(file2.toString()), null, 4);
    }
    catch {
        out = file + ": COMPARE CONSUMER FAIL\n";
        fs.appendFileSync('test-results.txt', out);
        failedTest = true;
        console.log("COMPARE CONSUMER FAIL");
    }
}

if (!failedTest) {
    if (file1 === file2) {
        out = file + ": SAME\n";
        fs.appendFileSync('test-results.txt', out);
        console.log("SAME");
    }
    else {
        out = file + ": DIFFERENT\n";
        fs.appendFileSync('test-results.txt', out);
        console.log("DIFFERENT");
    }
}
