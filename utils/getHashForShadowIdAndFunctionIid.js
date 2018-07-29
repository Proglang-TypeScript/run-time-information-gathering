/* global module */

"use strict";

(function(exp) {
	function getHashForShadowIdAndFunctionIid(shadowId, functionId) {
		return shadowId + " - " + functionId;
	}

	exp.getHashForShadowIdAndFunctionIid = getHashForShadowIdAndFunctionIid;

})(module.exports);