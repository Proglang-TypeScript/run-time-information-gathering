"use strict";

var b = {
	hello: "world"
};

function f1(a) {
	function f2(o) {
		b.hello = "world!";

		o.myMethod();

		function f3(s, c) {
			if (s && a.someValue < 100 && c.someValue < 100) {
				a.anotherValue = 1000;
				return a.anotherValue;
			}
		}

		return f3("myString", {someValue: 99});
	}

	var myObj = {
		myMethod: function() {
			if (a.aThirdValue < 100) {
				a.anotherThirdValue = 99;
				return a.anotherThirdValue;
			}
		}
	};

	return f2(myObj);
}

var a = {
	someValue: 99
};

a = f1(a);