/* global J$ */

"use strict";

(function (sandbox) {
	function ConditionalAnalysis() {
		this.callbackName = "conditional";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function(
			iid,
			result
		) {

			return {
				result: dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result)
			}
		};
	}

	sandbox.analysis = new ConditionalAnalysis();

}(J$));