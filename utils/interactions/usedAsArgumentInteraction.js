/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function UsedAsArgumentInteraction(currentActiveFiid, targetFunctionId, argIndex, traceIdInTargetFunction) {
		Interaction.call(this);

		this.code = "usedAsArgument";

		this.enclosingFunctionId = currentActiveFiid;
		this.targetFunctionId = targetFunctionId;
		this.traceIdInTargetFunction = traceIdInTargetFunction;
		this.argumentIndexInTargetFunction = argIndex;
	}

	UsedAsArgumentInteraction.prototype = Object.create(Interaction.prototype);
	UsedAsArgumentInteraction.prototype.constructor = UsedAsArgumentInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.UsedAsArgumentInteraction = UsedAsArgumentInteraction;
}(J$));