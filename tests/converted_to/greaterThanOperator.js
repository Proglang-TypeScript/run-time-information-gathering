function f(a) {
	return 5 > a;
}

var a = {};
a.toString = function() { return "3"; }

f(a);