"use strict";

function f1(a) {
	if(a.someValue < 100) {
		return 1;
	}

	else {
		return 0;
	}
}

function f2(a) {
	setTimeout(
		function() {
      		return f1(a);
		},
		300
	);
}

var a = {
	someValue: 100
};

f2(a);