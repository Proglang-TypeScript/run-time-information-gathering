/* global module */

"use strict";

(function(exp) {
	function FunctionEnter(runTimeInfo, functionsExecutionStack, functionIdHandler, sandbox) {
		var FunctionContainer = sandbox.utils.FunctionContainer;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.functionIdHandler = functionIdHandler;

		var dis = this;

		this.runCallback = function(iid, f) {
			let functionId = this.functionIdHandler.setFunctionId(f);

			if (functionNotProcessed(f)) {
				var functionContainer = new FunctionContainer(f);
				functionContainer.functionIid = iid;

				this.runTimeInfo[functionId] = functionContainer;
			}

			this.functionsExecutionStack.addExecution(functionId);
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}
	}

	exp.FunctionEnter = FunctionEnter;

})(module.exports);