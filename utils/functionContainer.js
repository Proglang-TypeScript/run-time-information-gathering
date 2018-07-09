/* global module */

"use strict";

(function(exp) {

	function FunctionContainer(functionId, name) {
		this.functionId = functionId;
		this.functionName = name;

		this.iid = null;
		this.isConstructor = null;
		this.isMethod = null;
		this.args = {};
		this.declarationEnclosingFunctionId = null;

		this.addArgumentContainer = function(argumentIndex, argumentContainer) {
			if (!(argumentIndex in this.args)) {
				this.args[argumentIndex] = argumentContainer;
			} else {
				this.args[argumentIndex].interactions = this.args[argumentIndex].interactions.concat(argumentContainer.interactions);
			}
		};

		this.getArgumentContainer = function(argumentIndex) {
			return this.args[argumentIndex];
		};
	}

	exp.FunctionContainer = FunctionContainer;

})(module.exports);