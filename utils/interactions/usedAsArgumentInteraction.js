/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function UsedAsArgumentInteraction(currentActiveFiid, functionId, argIndex) {
		Interaction.call(this);

		this.code = "usedAsArgument";

		this.enclosingFunctionId = currentActiveFiid;
		this.targetFunctionId = functionId;
		this.argumentIndexInTargetFunction = argIndex;
	}

	UsedAsArgumentInteraction.prototype = Object.create(Interaction.prototype);
	UsedAsArgumentInteraction.prototype.constructor = UsedAsArgumentInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.UsedAsArgumentInteraction = UsedAsArgumentInteraction;
}(J$));