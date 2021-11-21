'use strict';

function myFunction(myObj) {
  var a = {
    myField: 100,
  };

  if (a.myField < 1000) {
    return myObj.someValue < 100;
  } else {
    return false;
  }
}

function myFunction2(myObj) {
  var a = {
    myField: 100000,
  };

  if (a.myField < 1000) {
    return myObj.someValue < 100;
  } else {
    return false;
  }
}

var objWithoutSomeValue = {
  someValue: 1000,
};

myFunction(objWithoutSomeValue);

myFunction2(objWithoutSomeValue);
