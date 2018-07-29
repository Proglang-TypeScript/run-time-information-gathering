/* global module */

"use strict";

(function(exp) {
	function getHashForShadowIdAndFunctionId(shadowId, functionId) {
		return shadowId + " - " + functionId;
	}

	exp.getHashForShadowIdAndFunctionId = getHashForShadowIdAndFunctionId;

})(module.exports);