'use strict';

var a = {
  someValue: 99,
};

function getPropTimeout(b) {
  function doSomething() {
    setTimeout(function () {
      if (b.someValue < 100) {
        b.anotherValue = 1000;
      }

      if (b.anotherValue < 100) {
        b.anotherValue = 100;
      }
    }, 500);
  }

  return doSomething();
}

getPropTimeout(a);
