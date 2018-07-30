/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionId = require("./getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	function InteractionFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsInteractions = {};

		this.findInteraction = function(shadowId, functionId) {
			var fId = functionId;
			var mappedInteraction = this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionId(shadowId, fId)
			];

			var functionContainer = null;
			while(!mappedInteraction && fId) {
				functionContainer = this.runTimeInfo[fId];

				mappedInteraction = this.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionId(shadowId, fId)
				];

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
				this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionId(
					shadowId,
					functionId
				)] = interaction;
			}
		};
	}

	exp.InteractionFinder = InteractionFinder;

})(module.exports);