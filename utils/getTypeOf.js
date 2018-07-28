/* global module */
/* global require */

"use strict";

(function(exp) {
	var argumentWrapperObjectBuilder = new (require("./argumentWrapperObjectBuilder.js")).ArgumentWrapperObjectBuilder();

	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object") {
			if (val instanceof Array) {
				return "array";
			}

			if (val[argumentWrapperObjectBuilder.getOriginalTypeOfField()]) {
				return val[argumentWrapperObjectBuilder.getOriginalTypeOfField()];
			}
		}

		return typeof val;
	}

	exp.getTypeOf = getTypeOf;

})(module.exports);