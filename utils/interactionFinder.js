/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionIid = require("./getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function InteractionFinder(runTimeInfo, mapShadowIdsInteractions) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.findInteraction = function(shadowId, functionIid) {
			var fIid = functionIid;
			var mappedInteraction = this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionIid(shadowId, fIid)
			];

			var functionContainer = null;
			while(!mappedInteraction && fIid) {
				functionContainer = this.runTimeInfo[fIid];

				mappedInteraction = this.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionIid(shadowId, fIid)
				];

				if (!functionContainer) {
					fIid = null;
				} else {
					fIid = functionContainer.declarationEnclosingFunctionId;
				}
			}

			return mappedInteraction;
		};
	}

	exp.InteractionFinder = InteractionFinder;

})(module.exports);