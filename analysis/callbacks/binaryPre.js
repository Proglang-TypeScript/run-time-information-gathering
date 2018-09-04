/* global J$ */

"use strict";

(function (sandbox) {
	function BinaryPreAnalysis() {
		this.callbackName = "binaryPre";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function(
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

	sandbox.analysis = new BinaryPreAnalysis();

}(J$));