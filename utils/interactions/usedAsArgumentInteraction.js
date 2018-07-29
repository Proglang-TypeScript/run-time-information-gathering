/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function UsedAsArgumentInteraction(currentActiveFiid, functionId, argIndex) {
		Interaction.call(this);

		this.code = "usedAsArgument";

		this.enclosingFunctionId = currentActiveFiid;
		this.targetFunctionId = functionId;
		this.argumentIndexInTargetFunction = argIndex;
	}

	UsedAsArgumentInteraction.prototype = Object.create(Interaction.prototype);
	UsedAsArgumentInteraction.prototype.constructor = UsedAsArgumentInteraction;

	exp.UsedAsArgumentInteraction = UsedAsArgumentInteraction;
})(module.exports);