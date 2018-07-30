"use strict";

function f(s) {
	var index = s.indexOf("hello");

	return s.length < 100 && (index.toString() !== "-1") && (typeof s === "string") && s === "hello";
}

var s = "hello";

console.log(f(s));