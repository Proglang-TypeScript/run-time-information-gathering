/* global module */

"use strict";

(function(exp) {
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
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "number";

			return wrapperObj;
		};
	}

	exp.ArgumentWrapperObjectBuilder = ArgumentWrapperObjectBuilder;

})(module.exports);