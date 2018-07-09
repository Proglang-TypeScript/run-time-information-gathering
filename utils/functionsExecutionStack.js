/* global module */
/* global require */

"use strict";

(function(exp) {

	var Stack = require("./stack.js").Stack;

	function FunctionsExecutionStack() {
		this.stack = new Stack();

		this.addExecution = function(iid) {
			this.stack.push(iid);
		};

		this.stopExecution = function() {
			this.stack.pop();
		};

		this.getCurrentExecutingFunction = function() {
			return this.stack.top();
		};

		this.isThereAFunctionExecuting = function() {
			return this.stack.isEmpty();
		};
	}

	exp.FunctionsExecutionStacks = FunctionsExecutionStack;

})(module.exports);