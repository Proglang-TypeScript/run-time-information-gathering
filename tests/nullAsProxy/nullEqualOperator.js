/* eslint-disable no-console */
function looseEquality(a) {
  return a == null;
}

function strictEquality(a) {
  return a === null;
}

console.log(looseEquality(null));
console.log(strictEquality(null));
