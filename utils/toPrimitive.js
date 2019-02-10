/* global J$ */

"use strict";

(function (sandbox) {
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

		function isPrimitive(value) {
			return value !== Object(value);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.toPrimitive = toPrimitive;
}(J$));