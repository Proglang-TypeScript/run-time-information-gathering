/* global J$ */

"use strict";

(function (sandbox) {
	function ArgumentWrapperObjectBuilder() {
		this.getOriginalTypeOfField = function() {
			return "__ORIGINAL_TYPEOF__";
		};

		this.buildFromString = function(
			/* jshint ignore:start */
			val
			/* jshint ignore:end */
		) {
			let wrapperObj;
			/* jshint ignore:start */
			wrapperObj = new String(val);
			wrapperObj.TARGET_PROXY = val;
			wrapperObj.IS_WRAPPER_OBJECT = true;
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "string";

			return wrapperObj;
		};

		this.buildFromNumber = function(
			/* jshint ignore:start */
			val
			/* jshint ignore:end */
		) {
			let wrapperObj;
			/* jshint ignore:start */
			wrapperObj = new Number(val);
			wrapperObj.TARGET_PROXY = val;
			wrapperObj.IS_WRAPPER_OBJECT = true;
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "number";

			return wrapperObj;
		};

		this.buildFromUndefined = function(val) {
			if (val !== undefined) {
				return val;
			}

			let undefinedObj = {};
			undefinedObj.valueOf = function() {
				return undefined;
			};

			undefinedObj.toString = function() {
				return String(undefined);
			};

			undefinedObj[this.getOriginalTypeOfField()] = "undefined";
			undefinedObj.TARGET_PROXY = undefined;
			undefinedObj.IS_WRAPPER_OBJECT = true;

			return undefinedObj;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentWrapperObjectBuilder = new ArgumentWrapperObjectBuilder();

}(J$));