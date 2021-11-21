/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
function f(a) {
  a < 10;
  a == 10;
  a != 10;

  var b = a && 10;

  // eslint-disable-next-line no-constant-condition
  if (a || 10) {
  }

  a * 10;
  a / 10;
  a % 10;
  a === 10;
  a !== 10;
  a += 10;
}

f('hello');
