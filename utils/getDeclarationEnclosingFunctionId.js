/* global module */

"use strict";

(function(exp) {
	function getDeclarationEnclosingFunctionId(functionsExecutionStack) {
		if (!functionsExecutionStack.isThereAFunctionExecuting()) {
			return -1;
		}

		return functionsExecutionStack.getCurrentExecutingFunction();
	}

	exp.getDeclarationEnclosingFunctionId = getDeclarationEnclosingFunctionId;

})(module.exports);