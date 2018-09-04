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
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "number";

			return wrapperObj;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentWrapperObjectBuilder = new ArgumentWrapperObjectBuilder();

}(J$));