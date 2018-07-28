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
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "string";

			return wrapperObj;
		};
	}

	exp.ArgumentWrapperObjectBuilder = ArgumentWrapperObjectBuilder;

})(module.exports);