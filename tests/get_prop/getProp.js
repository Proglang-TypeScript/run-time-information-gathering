"use strict";

function someValueLessThan100(myObj) {
	return myObj.someValue < 100;
}

function variableValueLessThan100(myObj, key) {
	return myObj[key] < 100;
}

var a = "hello";
someValueLessThan100(a);

var objWithoutSomeValue = {
	anotherValue: 1000
};
someValueLessThan100(objWithoutSomeValue);

var objWithoutSomeValue = {
	someValue: 1000
};
someValueLessThan100(objWithoutSomeValue);

var obj = {
	someValue: null,
	anotherValue: 100
};
variableValueLessThan100(obj, "someValue");
variableValueLessThan100(obj, "anotherValue");