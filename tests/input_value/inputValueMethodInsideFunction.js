"use strict";

function myFunction(a) {
	var v = {
		val: 1
	};

	return a.executeMethod(v);
}

var a = {
	executeMethod: function(v) {
		return v.val < 100;
	}
};

myFunction(a);