/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function InputValueInteraction(type_of) {
		Interaction.call(this);

		this.code = "inputValue";
		this.typeof = type_of;
	}

	InputValueInteraction.prototype = Object.create(Interaction.prototype);
	InputValueInteraction.prototype.constructor = InputValueInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.InputValueInteraction = InputValueInteraction;
}(J$));