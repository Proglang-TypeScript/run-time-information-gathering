'use strict';

function setSomeValue(myObj) {
  myObj.someValue = 100;
  return myObj;
}

function setVariableValue(myObj, field) {
  myObj[field] = 100;
  return myObj;
}

function setVariableValueWithArray(myObj, field) {
  var a = [1, 2];

  myObj[field] = a;
  return myObj;
}

var a = {};
a.anotherValue = 200;
a = setSomeValue(a);

a = setVariableValue(a, 'someField');

a = setVariableValueWithArray(a, 'arrayField');
