/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionId = require("./getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	function InteractionFinder(runTimeInfo, mapShadowIdsInteractions) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

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
	}

	exp.InteractionFinder = InteractionFinder;

})(module.exports);