/* global J$ */

"use strict";

(function (sandbox) {
	function InteractionContainerFinder(sMemoryInterface) {
		this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsContainers = {};

		this.findInteraction = function(shadowId) {
			return this.mapShadowIdsContainers[shadowId];
		};

		this.addMapping = function(interaction, result) {
			var shadowId = this.sMemoryInterface.getShadowIdOfObject(result);

			if (shadowId) {
				if (this.mapShadowIdsContainers[shadowId] === undefined) {
					this.mapShadowIdsContainers[shadowId] = interaction;
				}
			}
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionContainerFinder = new InteractionContainerFinder(sandbox.utils.sMemoryInterface);
}(J$));