"use strict";

function f1(a) {
	function f2() {
		var insideObj = a.insideObj;
		var anotherInsideObj = insideObj.anotherInsideObj;

		function f3() {
			if (
				insideObj.anotherValue < 100 &&
				anotherInsideObj.anotherValue < 100 /*&&
				a.insideObj.anotherInsideObj.someValue < 100*/
			) {
				insideObj.anotherValue = 1000;
				return insideObj.anotherValue;
			}
		}

		return f3();
	}

	return f2();
}

var a = {
	insideObj: {
		anotherValue: 50,
		anotherInsideObj: {
			anotherValue: 50,
			someValue: 50
		}
	}
};

a = f1(a);