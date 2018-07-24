/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function UsedAsArgumentInteraction(currentActiveFiid, functionIid, argIndex) {
		Interaction.call(this);

		this.code = "usedAsArgument";

		this.enclosingFunctionId = currentActiveFiid;
		this.targetFunctionId = functionIid;
		this.argumentIndexInTargetFunction = argIndex;
	}

	UsedAsArgumentInteraction.prototype = Object.create(Interaction.prototype);
	UsedAsArgumentInteraction.prototype.constructor = UsedAsArgumentInteraction;

	exp.UsedAsArgumentInteraction = UsedAsArgumentInteraction;
})(module.exports);