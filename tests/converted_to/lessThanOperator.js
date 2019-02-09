function f(a) {
	return a < 5;
}

var a = {};
a.toString = function() { return "3"; }

f(a);