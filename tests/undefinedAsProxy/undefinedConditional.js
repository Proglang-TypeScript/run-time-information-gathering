function ifUndefined(a) {
  if (a) {
    return true;
  } else {
    return false;
  }
}

function denyUndefined(a) {
  return !a;
}

function andUndefined(a) {
  return a && true;
}

function orUndefined(a) {
  return a || true;
}

function negationUndefined(a) {
  return !!a;
}

console.log(ifUndefined(undefined));
console.log(denyUndefined(undefined));
console.log(andUndefined(undefined));
console.log(orUndefined(undefined));
console.log(negationUndefined(undefined));
