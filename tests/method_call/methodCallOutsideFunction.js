"use strict";

function doSomething(a, b) {
	if (a < b) {
		return a;
	} else {
		return b;
	}
}

var a = {
	myMethod: function(a, b) {
		return doSomething(a, b);
	}
};

a.myMethod("hello", 100);
a.myMethod(100, "hello");