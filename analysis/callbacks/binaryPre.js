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

			let originalLeft = getOriginalValueIfItIsAProxy(left);
			let originalRight = getOriginalValueIfItIsAProxy(right);

			if (op === "<") {
				let originalLeftPrimitive = toPrimitive(originalLeft, Number);
				let originalRightPrimitive = toPrimitive(originalRight, Number);

				let leftConvertedTo = {};
				let rightConvertedTo = {};

				if (originalLeftPrimitive !== originalLeft) {
					leftConvertedTo.toPrimitive = {
						hint: "number",
						typeOfResult: sandbox.functions.getTypeOf(originalLeftPrimitive)
					};
				}

				if (originalRightPrimitive !== originalRight) {
					rightConvertedTo.toPrimitive = {
						hint: "number",
						typeOfResult: sandbox.functions.getTypeOf(originalRightPrimitive)
					};
				}

				let typeOfLeft = sandbox.functions.getTypeOf(originalLeft);
				let typeOfRight = sandbox.functions.getTypeOf(originalRight);

				if (!(typeOfLeft === "string" && typeOfRight === "string")) {
					leftConvertedTo.convertedTo = "number";
					leftConvertedTo.isNaN = isNaN(originalLeft);

					rightConvertedTo.convertedTo = "number";
					rightConvertedTo.isNaN = isNaN(originalRight);
				} else {
					leftConvertedTo.convertedTo = "string";
					rightConvertedTo = "string";
				}
			}

			let equalityOperations = [
				"==",
				"!=",
				"===",
				"!=="
			];

			if (equalityOperations.indexOf(op) !== -1) {
				left = originalLeft;
				right = originalRight;
			}

			return {
				op: op,
				left: left,
				right: right,
				skip: false
			};
		};

		function isPrimitive(value) {
			return value !== Object(value);
		}

		function toPrimitive(input, preferredType) {
			if (typeof input !== "object" || input === null) {
				return input;
			}

			switch (preferredType) {
				case Number:
					return toNumber(input);
				case String:
					return toString(input);
				default:
					if (input instanceof Date) {
						return toString(input);
					} else {
						return toNumber(input);
					}
			}

			function toString(input) {
				if (isPrimitive(input.toString())) {
					return input.toString();
				}

				if (isPrimitive(input.valueOf())) {
					return input.valueOf();
				}

				throw new TypeError("Cannot convert object to primitive value");
			}

			function toNumber(input) {
				if (isPrimitive(input.valueOf())) {
					return input.valueOf();
				}

				if (isPrimitive(input.toString())) {
					return input.toString();
				}

				throw new TypeError("Cannot convert object to primitive value");
			}
		}

		function getOriginalValueIfItIsAProxy(val) {
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