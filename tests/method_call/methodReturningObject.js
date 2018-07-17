"use strict";

function doSomething(obj) {
	var insideObj = obj.myMethod();

	insideObj.someValue = 100;

	return insideObj.myMethodInside();
}

var a = {
	myMethod: function() {
		return {
			myMethodInside: function() {
				return "hello";
			}
		};
	}
};

doSomething(a);