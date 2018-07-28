"use strict";

function f(s) {
	return s.length < 100 && (s.indexOf("hello") !== -1) && (typeof s === "string");
}

var s = "hello";

console.log(f(s));