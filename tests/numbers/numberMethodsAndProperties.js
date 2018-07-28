"use strict";

function f(n) {
	return n.valueOf() < 100 && n.toString().length < 100 && (typeof n === "number");
}

var n = 99;

console.log(f(n));