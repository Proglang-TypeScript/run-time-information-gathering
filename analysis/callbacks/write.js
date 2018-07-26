/* global module */
/* global require */

"use strict";

(function(exp) {
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;

	function Write(functionsExecutionStack, sMemoryInterface) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;

		this.runCallback = function(val) {
			val = addDeclarationFunctionIdToFunctionsInsideObject(
				val,
				this.functionsExecutionStack,
				this.sMemoryInterface
			);

			return {
				result: val
			};
		};
	}

	exp.Write = Write;

})(module.exports);