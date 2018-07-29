/* global module */

"use strict";

(function(exp) {
	function FunctionIdHandler() {
		let counter = 1;
		let prefix = "functionId_";
		let functionIdField = "functionId";

		this.setFunctionId = function(f) {
			if (!f[functionIdField]) {
				f[functionIdField] = prefix + counter.toString();
				counter += 2;
			}

			return f[functionIdField];
		};

		this.getFunctionId = function(f) {
			return f[functionIdField];
		};
	}

	exp.FunctionIdHandler = FunctionIdHandler;

})(module.exports);