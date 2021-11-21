'use strict';

function f() {
  return 'hello';
}

// eslint-disable-next-line no-unused-vars
function getPropTimeout(a) {
  setTimeout(f, 500);
}

var a = {
  someValue: 99,
};

getPropTimeout(a);
