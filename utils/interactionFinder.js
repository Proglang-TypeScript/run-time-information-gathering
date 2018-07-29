/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionIid = require("./getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function InteractionFinder(runTimeInfo, mapShadowIdsInteractions) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.findInteraction = function(shadowId, functionId) {
			var fId = functionId;
			var mappedInteraction = this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionIid(shadowId, fId)
			];

			var functionContainer = null;
			while(!mappedInteraction && fId) {
				functionContainer = this.runTimeInfo[fId];

				mappedInteraction = this.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionIid(shadowId, fId)
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