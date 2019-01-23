/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function MethodCallInteraction(iid, methodName) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.methodName = methodName;

		this.code = 'methodCall';
		
		this.functionId = null;
		this.returnTypeOf = null;
		this.traceIdInTargetFunction = null;
	}

	MethodCallInteraction.prototype = Object.create(ActiveInteraction.prototype);
	MethodCallInteraction.prototype.constructor = MethodCallInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.MethodCallInteraction = MethodCallInteraction;
}(J$));