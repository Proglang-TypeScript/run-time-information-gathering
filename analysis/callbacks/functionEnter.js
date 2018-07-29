/* global module */
/* global require */

"use strict";

(function(exp) {
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;

	function FunctionEnter(runTimeInfo, functionsExecutionStack) {
		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;

		var dis = this;

		this.runCallback = function(iid, f) {
			setFunctionId(f, iid);

			if (functionNotProcessed(f)) {
				var functionContainer = new FunctionContainer(f.functionId, f.name);
				functionContainer.iid = f.functionId;
				functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;

				this.runTimeInfo[f.functionId] = functionContainer;
			}

			this.functionsExecutionStack.addExecution(f.functionId);
		};

		function functionNotProcessed(f) {
			let functionId = f.functionId;
			return (functionId && !(functionId in dis.runTimeInfo));
		}

		function setFunctionId(f, functionIid) {
			let functionIdField = "functionId";

			if (functionIid) {
				f[functionIdField] = functionIid;
			} else {
				if (f.methodIdentifier) {
					f[functionIdField] = f.methodIdentifier;
				}
			}
		}
	}

	exp.FunctionEnter = FunctionEnter;

})(module.exports);