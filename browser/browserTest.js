"use strict";

function f(obj) {
	if (obj.myValue < 100) {
		return true;
	}
}

$(function() {
	$("#button_click_me").click(function() {
		var myObj = {
			myValue: 90
		};

		console.log(f(myObj));
	});
});