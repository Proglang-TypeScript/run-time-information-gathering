"use strict";

var a = {
	someValue: 99
};

function getPropTimeout(b) {
	function doSomething() {
		setTimeout(
			function() {
				if (a.someValue < 100) {
					a.anotherValue = 1000;
				}

				if (b.anotherValue < 100) {
					b.anotherValue = 100;
				}
			},
			500
		);
	}

	return doSomething();
}

getPropTimeout(a);