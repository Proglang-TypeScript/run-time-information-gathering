var fs = require('fs'); 
var file1 = fs.readFileSync('output.json');
var file2 = fs.readFileSync('output-consumer.json');
var file1Clean = '{' + file1.toString().split('{').slice(1).join('{');
file1 = JSON.stringify(JSON.parse(file1Clean), null, 4);
file2 = JSON.stringify(JSON.parse(file2.toString()), null, 4);
if (file1 === file2) {
    console.log("They are the same");
}
else {
    console.log("They are different");
}