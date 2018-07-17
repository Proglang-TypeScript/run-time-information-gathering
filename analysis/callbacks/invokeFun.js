/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;

	function InvokeFun(runTimeInfo) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			result,
			isConstructor,
			isMethod,
			functionIid
		) {

			var functionContainer = getFunctionContainer(functionIid);

			if (functionContainer) {
				functionContainer.addReturnTypeOf(getTypeOf(result));
			}

			return {
				result: result
			};
		};

		function getFunctionContainer(functionIid) {
			return dis.runTimeInfo[functionIid];
		}
	}

	exp.InvokeFun = InvokeFun;

})(module.exports);