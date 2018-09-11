"use strict";

$(function() {
	function f(obj) {
		if (obj.myValue < 100) {
			console.log("less than 100!");
		}
	}

	$("#button_click_me").click(function() {
		var obj = {
			myValue: 90
		};

		f(obj);
	});
});