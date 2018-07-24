/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;
	var getTypeOf = require("../getTypeOf.js").getTypeOf;

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

	ActiveInteraction.prototype.setReturnTypeOf = function(result) {
		if (getTypeOf(result) == "object" && result.constructor.name != "Object") {
			this.returnTypeOf = result.constructor.name;
		} else {
			this.returnTypeOf = getTypeOf(result);
		}
	};

	exp.ActiveInteraction = ActiveInteraction;

})(module.exports);