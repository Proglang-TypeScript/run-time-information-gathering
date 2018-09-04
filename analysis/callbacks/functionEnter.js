/* global J$ */

"use strict";

(function (sandbox) {
	function FunctionEnterAnalysis() {
		this.callbackName = "functionEnter";

		var FunctionContainer = sandbox.utils.FunctionContainer;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.functionIdHandler = sandbox.utils.functionIdHandler;

		var dis = this;

		this.callback = function(iid, f) {
			let functionId = dis.functionIdHandler.setFunctionId(f);

			if (functionNotProcessed(f)) {
				var functionContainer = new FunctionContainer(f);
				functionContainer.functionIid = iid;

				dis.runTimeInfo[functionId] = functionContainer;
			}

			dis.functionsExecutionStack.addExecution(functionId);
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}
	}

	sandbox.analysis = new FunctionEnterAnalysis();

}(J$));