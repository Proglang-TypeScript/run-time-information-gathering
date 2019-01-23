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
			if (f.proxyMethod) {
				f = f.proxyMethod;
			}

			let functionId = dis.functionIdHandler.setFunctionId(f);
			let functionContainer;

			if (functionNotProcessed(f)) {
				functionContainer = new FunctionContainer(f);

				dis.runTimeInfo[functionId] = functionContainer;
			} else {
				functionContainer = dis.runTimeInfo[functionId];
			}

			functionContainer.functionIid = iid;

			dis.functionsExecutionStack.addExecution(f);
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}
	}

	sandbox.analysis = new FunctionEnterAnalysis();

}(J$));