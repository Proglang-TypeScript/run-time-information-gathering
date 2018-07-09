/* global module */

"use strict";

(function(exp) {

	function ArgumentContainer(argumentIndex, name) {
		this.argumentIndex = argumentIndex;
		this.argumentName = name;

		this.shadowId = null;
		this.interactions = [];

		this.addInteraction = function(interaction) {
			this.interactions.push(interaction);
		};
	}

	exp.ArgumentContainer = ArgumentContainer;

})(module.exports);