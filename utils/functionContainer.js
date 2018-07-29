/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOfForReporting = require("./getTypeOf.js").getTypeOfForReporting;

	function FunctionContainer(functionId, name) {
		this.functionId = functionId;
		this.functionName = name;

		this.iid = null;
		this.isConstructor = null;
		this.isMethod = null;
		this.args = {};
		this.declarationEnclosingFunctionId = null;
		this.returnTypeOfs = [];

		this.addArgumentContainer = function(argumentIndex, argumentContainer) {
			if (!(argumentIndex in this.args)) {
				this.args[argumentIndex] = argumentContainer;
			} else {
				this.args[argumentIndex].interactions = this.args[argumentIndex].interactions.concat(argumentContainer.interactions);
			}
		};

		this.addReturnTypeOf = function(typeOf) {
			this.returnTypeOfs.push(getTypeOfForReporting(typeOf));
		};

		this.getArgumentContainer = function(argumentIndex) {
			return this.args[argumentIndex];
		};
	}

	exp.FunctionContainer = FunctionContainer;

})(module.exports);