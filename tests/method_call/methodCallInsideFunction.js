"use strict";

function doSomething(obj, a, b) {
	return obj.myMethod(a, b);
}

var a = {
	myMethod: function(a, b) {
		if (a < b) {
			return a;
		} else {
			return b;
		}
	}
};

doSomething(a, "hello", 100);
doSomething(a, 100, "hello");