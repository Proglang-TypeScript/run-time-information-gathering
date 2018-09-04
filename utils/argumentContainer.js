/* global J$ */

"use strict";

(function (sandbox) {

	function ArgumentContainer(argumentIndex, name) {
		this.argumentIndex = argumentIndex;
		this.argumentName = name;

		this.interactions = [];

		this.addInteraction = function(interaction) {
			this.interactions.push(interaction);
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.ArgumentContainer = ArgumentContainer;
}(J$));