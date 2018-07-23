/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function InputValueInteraction(type_of) {
		Interaction.call(this);

		this.code = "inputValue";
		this.typeof = type_of;
	}

	InputValueInteraction.prototype = Object.create(Interaction.prototype);
	InputValueInteraction.prototype.constructor = InputValueInteraction;

	exp.InputValueInteraction = InputValueInteraction;

})(module.exports);