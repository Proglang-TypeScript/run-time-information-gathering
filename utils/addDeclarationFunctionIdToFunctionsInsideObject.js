/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("./getTypeOf.js").getTypeOf;
	var getDeclarationEnclosingFunctionId = require("./getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	function addDeclarationFunctionIdToFunctionsInsideObject(val) {
		if (getTypeOf(val) == "object") {
			for (var key in val) {
				if (getTypeOf(val[key]) == "function") {
					val[key].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
				}

				val[key] = addDeclarationFunctionIdToFunctionsInsideObject(val[key]);
			}
		}

		return val;
	}

	exp.addDeclarationFunctionIdToFunctionsInsideObject = addDeclarationFunctionIdToFunctionsInsideObject;

})(module.exports);