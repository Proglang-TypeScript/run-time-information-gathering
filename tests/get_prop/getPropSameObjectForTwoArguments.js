'use strict';

function doNothingMyObj(myObj) {
  return myObj;
}

function doNothingMyOtherObj(myOtherObj) {
  return myOtherObj;
}

function someValueLessThan100(myObj, myOtherObj) {
  return myObj.myValue < 1000 && myOtherObj.myOtherValue < 1000 && myObj == myOtherObj;
}

var a = {
  myValue: 100,
  myOtherValue: 100,
};

var b = doNothingMyObj(a);

var c = doNothingMyOtherObj(b);

console.log(someValueLessThan100(b, c));
