"use strict";

function setSomeValue(myObj, myObj2) {
	var anotherInsideObj = myObj.insideObj.anotherInsideObj;
	anotherInsideObj.someValue = 100;

	myObj2.insideObj.anotherInsideObj.someValue = 555;

	myObj.myObj2 = myObj2;

	return myObj;
}


var a = {
	insideObj: {
		anotherInsideObj: {
			anotherValue: 1000
		}
	}
};

var b = {
	insideObj: {
		anotherInsideObj: {
			anotherValue: 1000
		}
	}
};

a = setSomeValue(a, b);