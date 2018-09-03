"use strict";

function f(obj) {
	if (obj.myValue < 100) {
		return true;
	}
}

var myObj = {
	myValue: 90
};

console.log(f(myObj));