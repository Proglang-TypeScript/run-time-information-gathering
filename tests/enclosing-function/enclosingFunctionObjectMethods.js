"use strict";

function f1(a) {
	function f2(o) {
		o.myMethod();
		o.myObj2.myMethod2();

		o.myObj3.anotherMethod3();

		return o.anotherMethod();
	}

	var myObj = {
		myMethod: function() {
			if (a.aThirdValue < 100) {
				a.anotherThirdValue = 99;
				return a.anotherThirdValue;
			}
		},
		myObj2: {
			myMethod2: function() {
				if (a.aThirdValue2 < 100) {
					a.anotherThirdValue2 = 99;
					return a.anotherThirdValue2;
				}
			}
		}
	};

	myObj.anotherMethod = function() {
		if (a.aFourthValue < 100) {
			a.aFourthValue = 99;
			return a.aFourthValue;
		}
	};

	myObj.myObj3 = {
		anotherMethod3: function() {
			if (a.aFourthValue3 < 100) {
				a.aFourthValue3 = 99;
				return a.aFourthValue3;
			}
		}
	};

	return f2(myObj);
}

var a = {
	someValue: 99
};

a = f1(a);