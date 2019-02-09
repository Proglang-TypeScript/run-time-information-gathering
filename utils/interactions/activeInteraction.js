/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;
	var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;

	function ActiveInteraction() {
		Interaction.call(this);

		this.isComputed = null;
		this.isOpAssign = null;
		this.enclosingFunctionId = null;
		this.followingInteractions = [];
	}

	ActiveInteraction.prototype = Object.create(Interaction.prototype);
	ActiveInteraction.prototype.constructor = ActiveInteraction;

	ActiveInteraction.prototype.addInteraction = function(followingInteraction) {
		this.followingInteractions.push(followingInteraction);
	};

	ActiveInteraction.prototype.setReturnTypeOf = function(result) {
		this.returnTypeOf = getTypeOfForReporting(result);
	};

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.ActiveInteraction = ActiveInteraction;
}(J$));