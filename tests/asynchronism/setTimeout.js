"use strict";

function getPropTimeout(a) {
	function f() {
			a.hello = "world";

			function f1() {
				a.anotherValue = 100;

				function f2() {
					if (a.someValue < 100) {
						a.anotherValue = 1000;
					}
				}

				f2();
			}

			f1();
	}

	setTimeout(
		f,
		500
	);
}

var a = {
	someValue: 99
};

getPropTimeout(a);