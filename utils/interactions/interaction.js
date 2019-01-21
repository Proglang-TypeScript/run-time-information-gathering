/* global J$ */

"use strict";

(function (sandbox) {
	function Interaction() {
		this.code = null;
		this.traceId = null;
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.Interaction = Interaction;
}(J$));