/* global module */
/* global require */

"use strict";

(function(exp) {
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;

	function Write(functionsExecutionStack) {
		this.functionsExecutionStack = functionsExecutionStack;

		this.runCallback = function(val) {
			val = addDeclarationFunctionIdToFunctionsInsideObject(val, this.functionsExecutionStack);

			return {
				result: val
			};
		};
	}

	exp.Write = Write;

})(module.exports);