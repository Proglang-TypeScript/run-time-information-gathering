/* global module */

"use strict";

(function(exp) {
	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object" && val instanceof Array) {
			return "array";
		}

		return typeof val;
	}

	exp.getTypeOf = getTypeOf;

})(module.exports);