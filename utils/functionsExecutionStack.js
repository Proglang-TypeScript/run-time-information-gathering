/* global J$ */

"use strict";

(function (sandbox) {
	function Stack() {
		this.s = [];

		this.push = function(data) {
			this.s.push(data);
		};

		this.pop = function() {
			return this.s.pop();
		};

		this.top = function() {
			if (this.s.length === 0) {
				return null;
			}

			return this.s[this.s.length - 1];
		};

		this.isEmpty = function() {
			return (this.s.length === 0);
		};
	}

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
			return !this.stack.isEmpty();
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.FunctionsExecutionStack = new FunctionsExecutionStack();

}(J$));