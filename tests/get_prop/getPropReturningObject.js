'use strict';

function f(o) {
  return o.insideObj.someValue < 100 || o.insideObj.anotherInsideObj.anotherValue < 1000;
}

var a = {
  insideObj: {
    someValue: 100,
    anotherInsideObj: {
      anotherValue: 1000,
    },
  },
};

a = f(a);
