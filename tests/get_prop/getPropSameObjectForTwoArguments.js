"use strict";

function someValueLessThan100(myObj, myOtherObj) {
	return (myObj.someValue < 100) && (myOtherObj.anotherValue < 10000);
}

var a = {
	someValue: 99,
	anotherValue: 999
};

someValueLessThan100(a, a);