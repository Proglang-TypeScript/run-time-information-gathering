/* global module */
/* global require */

"use strict";

(function(exp) {
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;

	function Write() {
		this.runCallback = function(val) {
			val = addDeclarationFunctionIdToFunctionsInsideObject(val);

			return {
				result: val
			};
		};
	}

	exp.Write = Write;

})(module.exports);