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

			let newResult = result;

			if (dis.wrapperObjectsHandler.objectIsWrapperObject(result)) {
				let finalRealValueFromWrapperObject = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result);

				if ((finalRealValueFromWrapperObject === undefined) || (finalRealValueFromWrapperObject === null)) {
					newResult = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result);
				}
			}

			return {
				result: newResult
			}
		};
	}

	sandbox.analysis = new ConditionalAnalysis();

}(J$));