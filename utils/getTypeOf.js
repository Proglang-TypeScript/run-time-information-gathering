/* global module */
/* global require */

"use strict";

(function(exp) {
	var argumentWrapperObjectBuilder = new (require("./argumentWrapperObjectBuilder.js")).ArgumentWrapperObjectBuilder();

	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object" && val instanceof Array) {
			return "array";
		}

		return typeof val;
	}

	function getTypeOfForReporting(val) {
		if (getTypeOf(val) == "object") {
			if (val[argumentWrapperObjectBuilder.getOriginalTypeOfField()]) {
				return val[argumentWrapperObjectBuilder.getOriginalTypeOfField()];
			}

			if(val.constructor.name != "Object") {
				return val.constructor.name;
			}
		}

		return getTypeOf(val);
	}

	exp.getTypeOf = getTypeOf;
	exp.getTypeOfForReporting = getTypeOfForReporting;

})(module.exports);