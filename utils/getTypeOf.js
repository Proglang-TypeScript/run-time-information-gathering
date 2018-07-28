/* global module */

"use strict";

(function(exp) {
	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object") {
			if (val instanceof Array) {
				return "array";
			}

			if (val.__ORIGINAL_TYPEOF__) {
				return val.__ORIGINAL_TYPEOF__;
			}
		}

		return typeof val;
	}

	exp.getTypeOf = getTypeOf;

})(module.exports);