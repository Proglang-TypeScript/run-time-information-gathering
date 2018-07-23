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
		this.followingInteractions = [];
	}

	ActiveInteraction.prototype = Object.create(Interaction.prototype);
	ActiveInteraction.prototype.constructor = ActiveInteraction;

	ActiveInteraction.prototype.addFollowingInteraction = function(followingInteraction) {
		this.followingInteractions.push(followingInteraction);
	};

	exp.ActiveInteraction = ActiveInteraction;

})(module.exports);