var fs = require('fs');

try {
	fs.readFileSync("hello");
} catch (error) {
	if (error.code !== "ENOENT") {
		throw error;
	}
}