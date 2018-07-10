/* global module */
/* global require */

"use strict";

(function(exp) {
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;

	function FunctionEnter(runTimeInfo, functionsExecutionStack) {
		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;

		this.runCallback = function(iid, f) {
			if (iid && !(iid in this.runTimeInfo)) {
				var functionContainer = new FunctionContainer(iid, f.name);
				functionContainer.iid = iid;
				functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;

				this.runTimeInfo[iid] = functionContainer;
			}

			this.functionsExecutionStack.addExecution(iid);
		};
	}

	exp.FunctionEnter = FunctionEnter;

})(module.exports);