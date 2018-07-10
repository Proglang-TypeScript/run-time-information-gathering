/* global module */

"use strict";

(function(exp) {
	function getRandomIdentifier() {
		var now = new Date();
		return Math.floor((Math.random() * 1000) + 1).toString() + now.getTime();
	}

	exp.getRandomIdentifier = getRandomIdentifier;

})(module.exports);