"use strict";

function f(a) {
	return a;
}

f("a");
f(1);
f();
f(null);
f({hello: "world"});
f([]);
f(true);
f(function() {});