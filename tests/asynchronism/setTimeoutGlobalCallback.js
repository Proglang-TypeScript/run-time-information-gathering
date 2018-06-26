"use strict";

function f() {
	return "hello";
}

function getPropTimeout(a) {
	setTimeout(
		f,
		500
	);
}

var a = {
	someValue: 99
};

getPropTimeout(a);