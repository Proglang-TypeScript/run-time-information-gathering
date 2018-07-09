/* global module */

"use strict";

(function(exp) {

	function FunctionEnter(argumentIndex, name) {
		this.argumentIndex = argumentIndex;
		this.argumentName = name;

		this.shadowId = null;
		this.interactions = [];

		this.addInteraction = function(interaction) {
			this.interactions.push(interaction);
		};
	}

	exp.FunctionEnter = FunctionEnter;

})(module.exports);