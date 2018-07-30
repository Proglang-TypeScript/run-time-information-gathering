/* global module */

"use strict";

(function(exp) {
	function UnaryPre(wrapperObjectsHandler) {
		this.wrapperObjectsHandler = wrapperObjectsHandler;

		var dis = this;

		this.runCallback = function (iid, op, left) {
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

	exp.UnaryPre = UnaryPre;

})(module.exports);