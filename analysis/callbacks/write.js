/* global J$ */

"use strict";

(function (sandbox) {
	function WriteAnalysis() {
		this.callbackName = "write";

		var addDeclarationFunctionIdToFunctionsInsideObject = sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;

		var dis = this;

		this.callback = function(iid, name, val) {
			addDeclarationFunctionIdToFunctionsInsideObject(
				val,
				dis.functionsExecutionStack,
				dis.sMemoryInterface
			);

			return {
				result: val
			};
		};
	}

	sandbox.analysis = new WriteAnalysis();

}(J$));