/* global module */

"use strict";

(function(exp) {

	function Write(functionsExecutionStack, sMemoryInterface, sandbox) {
		var addDeclarationFunctionIdToFunctionsInsideObject = sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

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