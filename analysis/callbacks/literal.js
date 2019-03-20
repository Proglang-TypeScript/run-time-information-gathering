/* global J$ */

"use strict";

(function (sandbox) {
	function LiteralAnalysis() {
		this.callbackName = "literal";

		var dis = this;

		this.callback = function (iid, val, hasGetterSetter) {
			if (typeof val === "function") {
				val.isInstrumented = true;
			}

			return {
				result: val
			};
		};
	}

	sandbox.analysis = new LiteralAnalysis();

}(J$));