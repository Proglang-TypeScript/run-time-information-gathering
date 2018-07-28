/* global module */

"use strict";

(function(exp) {
	function BinaryPre(mapProxyObjectsOriginalObjects, sMemoryInterface) {
		this.mapProxyObjectsOriginalObjects = mapProxyObjectsOriginalObjects;
		this.sMemoryInterface = sMemoryInterface;

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
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

			if (shadowId in dis.mapProxyObjectsOriginalObjects) {
				return getRealObjectFromProxy(shadowId);
			} else {
				return val;
			}
		}

		function getRealObjectFromProxy(shadowId) {
			var targetObjectFromProxy = dis.mapProxyObjectsOriginalObjects[shadowId];

			if (dis.sMemoryInterface.getShadowIdOfObject(targetObjectFromProxy) in dis.mapProxyObjectsOriginalObjects) {
				return getRealObjectFromProxy(dis.sMemoryInterface.getShadowIdOfObject(targetObjectFromProxy));
			}

			return targetObjectFromProxy;
		}
	}

	exp.BinaryPre = BinaryPre;

})(module.exports);