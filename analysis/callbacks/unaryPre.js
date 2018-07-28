/* global module */

"use strict";

(function(exp) {
	function UnaryPre(mapWrapperObjectsOriginalValues, sMemoryInterface) {
		this.mapWrapperObjectsOriginalValues = mapWrapperObjectsOriginalValues;
		this.sMemoryInterface = sMemoryInterface;

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
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

			if (shadowId in dis.mapWrapperObjectsOriginalValues) {
				return dis.mapWrapperObjectsOriginalValues[shadowId];
			}
			
			return val;
		}
	}

	exp.UnaryPre = UnaryPre;

})(module.exports);