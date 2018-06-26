"use strict";

function f1(a) {
	function f2(o) {
		o.myMethod();
		return o.anotherMethod();
	}

	var myObj = {
		myMethod: function() {
			if (a.aThirdValue < 100) {
				a.anotherThirdValue = 99;
				return a.anotherThirdValue;
			}
		}
	};

	myObj.anotherMethod = function() {
		if (a.aFourthValue < 100) {
			a.aFourthValue = 99;
			return a.aFourthValue;
		}
	};

	return f2(myObj);
}

var a = {
	someValue: 99
};

a = f1(a);