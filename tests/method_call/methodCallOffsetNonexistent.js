"use strict";

function doSomething(obj, a, b) {
	obj.anotherMethod(a, b);
}

var a = {};

doSomething(a, "hello", 100);