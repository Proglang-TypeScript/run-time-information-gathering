/* global J$ */

"use strict";

(function (sandbox) {
	function UnaryPreAnalysis() {
		this.callbackName = "unaryPre";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function (iid, op, left) {
			if (op === "typeof") {
				left = replaceValueIfItIsAWrapperObject(left);
			}

			return {
				op: op,
				left: left,
				skip: false
			};
		};

		function replaceValueIfItIsAWrapperObject(val) {
			if (dis.wrapperObjectsHandler.objectIsWrapperObject(val)) {
				return dis.wrapperObjectsHandler.getRealValueFromWrapperObject(val);
			} else {
				return val;
			}
		}
	}

	sandbox.analysis = new UnaryPreAnalysis();

}(J$));