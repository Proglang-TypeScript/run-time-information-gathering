/* global J$ */

"use strict";

(function (sandbox) {
	function InteractionFinder(sMemoryInterface) {
		this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsInteractions = {};

		this.findInteraction = function(shadowId) {
			return this.mapShadowIdsInteractions[shadowId];
		};

		this.addMapping = function(interaction, functionId, result) {
			var shadowId = this.sMemoryInterface.getShadowIdOfObject(result);

			if (shadowId && functionId) {
				this.mapShadowIdsInteractions[shadowId] = interaction;
			}
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionFinder = new InteractionFinder(sandbox.utils.sMemoryInterface);
}(J$));