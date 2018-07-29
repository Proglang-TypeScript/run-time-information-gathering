/* global module */
/* global require */

"use strict";

(function(exp) {
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;

	function FunctionEnter(runTimeInfo, functionsExecutionStack, functionIdHandler) {
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