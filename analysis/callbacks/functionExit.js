/* global J$ */

"use strict";

(function (sandbox) {
	function FunctionExitAnalysis() {
		this.callbackName = "functionExit";

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;

		var dis = this;

		this.callback = function(iid, returnVal, wrappedExceptionVal) {
			dis.functionsExecutionStack.stopExecution();

			return {
				returnVal: returnVal,
				wrappedExceptionVal: wrappedExceptionVal,
				isBacktrack: false
			};
		};
	}

	sandbox.analysis = new FunctionExitAnalysis();
}(J$));