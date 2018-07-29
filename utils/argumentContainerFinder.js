/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionIid = require("./getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function ArgumentContainerFinder(runTimeInfo, mapShadowIdsArgumentContainer) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsArgumentContainer = mapShadowIdsArgumentContainer;

        this.findArgumentContainer = function(shadowId, functionId) {
            var fId = functionId;
            var argumentContainer = this.mapShadowIdsArgumentContainer[
                getHashForShadowIdAndFunctionIid(shadowId, fId)
            ];

            var functionContainer = null;
            while(!argumentContainer && fId) {
                functionContainer = this.runTimeInfo[fId];

                argumentContainer = this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionIid(shadowId, fId)
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