/* global J$ */

"use strict";

(function (sandbox) {
	var getHashForShadowIdAndFunctionId = sandbox.functions.getHashForShadowIdAndFunctionId;

	function InteractionFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsInteractions = {};

		this.findInteraction = function(shadowId, functionId) {
			var fId = functionId;
			var mappedInteraction = this.mapShadowIdsInteractions[getHashForShadowIdAndFunctionId(shadowId)];

			var functionContainer = null;
			while(!mappedInteraction && fId) {
				functionContainer = this.runTimeInfo[fId];

				mappedInteraction = this.mapShadowIdsInteractions[getHashForShadowIdAndFunctionId(shadowId)];

				if (!functionContainer) {
					fId = null;
				} else {
					fId = functionContainer.declarationEnclosingFunctionId;
				}
			}

			return mappedInteraction;
		};

		this.addMapping = function(interaction, functionId, result) {
			var shadowId = this.sMemoryInterface.getShadowIdOfObject(result);

			if (shadowId && functionId) {
				this.mapShadowIdsInteractions[getHashForShadowIdAndFunctionId(shadowId)] = interaction;
			}
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionFinder = new InteractionFinder(
		sandbox.runTimeInfo,
		sandbox.utils.sMemoryInterface
	);
}(J$));