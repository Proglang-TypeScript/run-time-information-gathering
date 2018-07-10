/* global module */

"use strict";

(function(exp) {
	function FunctionExit(functionsExecutionStack) {
		this.functionsExecutionStack = functionsExecutionStack;

		this.runCallback = function(iid, returnVal, wrappedExceptionVal) {
			this.functionsExecutionStack.stopExecution();

			return {
				returnVal: returnVal,
				wrappedExceptionVal: wrappedExceptionVal,
				isBacktrack: false
			};
		};
	}

	exp.FunctionExit = FunctionExit;

})(module.exports);