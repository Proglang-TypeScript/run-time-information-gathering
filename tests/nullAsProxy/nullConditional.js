/* eslint-disable no-console */
function ifNull(a) {
  if (a) {
    return true;
  } else {
    return false;
  }
}

function denyNull(a) {
  return !a;
}

function andNull(a) {
  return a && true;
}

function orNull(a) {
  return a || true;
}

function negationNull(a) {
  return !!a;
}

console.log(ifNull(null));
console.log(denyNull(null));
console.log(andNull(null));
console.log(orNull(null));
console.log(negationNull(null));
