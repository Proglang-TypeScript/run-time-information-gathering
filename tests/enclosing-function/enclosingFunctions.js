/* eslint-disable no-unused-vars */
'use strict';

var b = {
  hello: 'world',
};

function f1(a) {
  function f2() {
    b.hello = 'world!';

    a.someValue = 98;

    function f3(s, c) {
      if (s && a.someValue < 100 && c.someValue < 100) {
        a.anotherValue = 1000;
        return a.anotherValue;
      }
    }

    return f3('myString', { someValue: 99 });
  }

  return f2();
}

var a = {
  someValue: 99,
};

a = f1(a);
