/* eslint-disable no-console */
function looseEquality(a) {
  return a == undefined;
}

function strictEquality(a) {
  return a === undefined;
}

console.log(looseEquality(undefined));
console.log(strictEquality(undefined));
