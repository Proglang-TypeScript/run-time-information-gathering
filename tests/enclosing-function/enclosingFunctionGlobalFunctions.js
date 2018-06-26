"use strict";

function f3(s, c) {
	if (s && c.someValue < 100) {
		c.anotherValue = 1000;
		return c.anotherValue;
	}
}

function f2(o) {
	o.myMethod();

	return f3("myString", {someValue: 99});
}

function f1() {
	var myObj = {
		myMethod: function() {

		}
	};

	return f2(myObj);
}

var a = {
	someValue: 99
};

a = f1(a);