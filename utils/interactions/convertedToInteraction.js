/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function ConvertedToInteraction() {
		Interaction.call(this);

		this.code = "convertedTo";

		this.convertedTo = "";
		this.isNaN = false;
		this.toPrimitive = null;
		this.operator = "";
		this.originalTypeof = "";

		this.addToPrimitive = function(hint, typeOfResult) {
			this.toPrimitive = {
				hint: hint,
				typeOfResult: typeOfResult
			};
		}
	}

	ConvertedToInteraction.prototype = Object.create(Interaction.prototype);
	ConvertedToInteraction.prototype.constructor = ConvertedToInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.ConvertedToInteraction = ConvertedToInteraction;
}(J$));