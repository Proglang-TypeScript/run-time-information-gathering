/* global module */

"use strict";

(function(exp) {
	function getHashForShadowIdAndFunctionIid(shadowId, functionIid) {
		return shadowId + " - " + functionIid;
	}

	exp.getHashForShadowIdAndFunctionIid = getHashForShadowIdAndFunctionIid;

})(module.exports);