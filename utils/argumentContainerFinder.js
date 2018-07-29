/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionId = require("./getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	function ArgumentContainerFinder(runTimeInfo, mapShadowIdsArgumentContainer) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsArgumentContainer = mapShadowIdsArgumentContainer;

        this.findArgumentContainer = function(shadowId, functionId) {
            var fId = functionId;
            var argumentContainer = this.mapShadowIdsArgumentContainer[
                getHashForShadowIdAndFunctionId(shadowId, fId)
            ];

            var functionContainer = null;
            while(!argumentContainer && fId) {
                functionContainer = this.runTimeInfo[fId];

                argumentContainer = this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionId(shadowId, fId)
                ];

                if (!functionContainer) {
                    fId = null;
                } else {
                    fId = functionContainer.declarationEnclosingFunctionId;
                }
            }

            return argumentContainer;
        };
	}

	exp.ArgumentContainerFinder = ArgumentContainerFinder;

})(module.exports);