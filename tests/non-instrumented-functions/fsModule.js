var readFileSync = require('fs').readFileSync;

function f(a) {
  try {
    readFileSync(a);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

f('hello');
