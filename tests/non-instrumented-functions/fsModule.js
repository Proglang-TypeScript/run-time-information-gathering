var fs = require('fs');

function f(a) {
	try {
		fs.readFileSync(a);
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}
}

f("hello");