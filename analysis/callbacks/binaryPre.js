/* global module */

"use strict";

(function(exp) {
	function BinaryPre(wrapperObjectsHandler) {
		this.wrapperObjectsHandler = wrapperObjectsHandler;

		var dis = this;

		this.runCallback = function(
			iid,
			op,
			left,
			right
		) {

			let equalityOperations = [
				"==",
				"!=",
				"===",
				"!=="
			];

			if (equalityOperations.indexOf(op) !== -1) {
				left = replaceValueIfItIsAProxy(left);
				right = replaceValueIfItIsAProxy(right);
			}

			return {
				op: op,
				left: left,
				right: right,
				skip: false
			};
		};

		function replaceValueIfItIsAProxy(val) {
			if (dis.wrapperObjectsHandler.objectIsWrapperObject(val)) {
				return getRealObjectFromProxy(val);
			} else {
				return val;
			}
		}

		function getRealObjectFromProxy(val) {
			var targetObjectFromProxy = dis.wrapperObjectsHandler.getRealValueFromWrapperObject(val);

			if (dis.wrapperObjectsHandler.objectIsWrapperObject(targetObjectFromProxy)) {
				return getRealObjectFromProxy(targetObjectFromProxy);
			}

			return targetObjectFromProxy;
		}
	}

	exp.BinaryPre = BinaryPre;

})(module.exports);