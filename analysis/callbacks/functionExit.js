/* global module */

"use strict";

(function(exp) {
	function FunctionExit(functionsExecutionStack) {
		this.functionsExecutionStack = functionsExecutionStack;

		this.runCallback = function() {
			this.functionsExecutionStack.stopExecution();
		};
	}

	exp.FunctionExit = FunctionExit;

})(module.exports);