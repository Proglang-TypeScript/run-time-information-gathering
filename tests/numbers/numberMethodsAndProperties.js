"use strict";

function f(n) {
	return n.valueOf() < 100 && n.toString().length < 100 && (typeof n === "number") && (n === 99);
}

var n = 99;

console.log(f(n));