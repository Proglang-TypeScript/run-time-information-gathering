"use strict";

function executeFunctions(obj) {
	for (var i = 0; i < 20; i++) { 
		obj.returnRandomTypeOf();
	}
}

var a = {
	returnRandomTypeOf: function() {
		var r = Math.floor(Math.random() * 100) + 0;

		if (r < 25) {
			return "hello";
		}

		if (r < 50) {
			return 123;
		}

		if (r < 75) {
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