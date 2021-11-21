'use strict';

function getPropTimeout(a) {
  function f() {
    a.hello = 'world';

    var b = {
      someValue: 99,
    };

    function f1(b) {
      a.anotherValue = 100;

      function f2() {
        if (a.someValue < 100) {
          a.anotherValue = 1000;
        }

        if (b.someValue < 100) {
          b.anotherValue = 1000;
        }
      }

      f2();
    }

    f1(b);
  }

  setTimeout(f, 500);
}

var a = {
  someValue: 99,
};

getPropTimeout(a);
