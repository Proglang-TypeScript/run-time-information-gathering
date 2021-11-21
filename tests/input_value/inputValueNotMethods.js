'use strict';

function myFunction(a, b) {
  return a < b;
}

function myFunction2(a, b, c) {
  return c;
}

myFunction('a', 'b');
myFunction(1, 2);
myFunction('a', 1);

myFunction('a');
myFunction(1);

myFunction2(1, 2, 3, 4);
