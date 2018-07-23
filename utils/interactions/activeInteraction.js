/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function ActiveInteraction() {
		Interaction.call(this);

		this.isComputed = null;
		this.isOpAssign = null;
		this.enclosingFunctionId = null;
	}

	ActiveInteraction.prototype = Object.create(Interaction.prototype);
	ActiveInteraction.prototype.constructor = ActiveInteraction;

	exp.ActiveInteraction = ActiveInteraction;

})(module.exports);