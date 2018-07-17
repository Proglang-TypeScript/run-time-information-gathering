"use strict";

function executeFunctions(obj) {
	for (var i = 0; i < 20; i++) {
		a.seed = i;
		obj.returnRandomTypeOf(i);
	}
}

var a = {
	returnRandomTypeOf: function() {
		if ((this.seed % 4) === 0) {
			return "hello";
		}

		if ((this.seed % 4) === 1) {
			return 123;
		}

		if ((this.seed % 4) === 2) {
			var f = function() {
				return 123;
			};

			return f;
		}

		return {
			someValue: 100
		};
	}
};

executeFunctions(a);