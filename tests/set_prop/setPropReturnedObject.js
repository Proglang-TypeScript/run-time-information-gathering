"use strict";

function setSomeValue(myObj) {
	var insideObj = myObj.insideObj;

	insideObj.someValue = 100;

	return myObj;
}


var a = {
	insideObj: {
		anotherValue: 1000
	}
};

a = setSomeValue(a);