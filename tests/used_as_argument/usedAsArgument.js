'use strict';

function f1(a) {
  if (a.someValue < 100) {
    return 1;
  } else {
    return 0;
  }
}

function f2(a) {
  return f1(a);
}

function f3(a) {
  return f2(a);
}

var a = {
  someValue: 100,
};

f2(a);
f3(a);
