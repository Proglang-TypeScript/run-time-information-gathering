/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionIid = require("./getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function ArgumentContainerFinder(runTimeInfo, mapShadowIdsArgumentContainer) {
		this.runTimeInfo = runTimeInfo;
		this.mapShadowIdsArgumentContainer = mapShadowIdsArgumentContainer;

        this.findArgumentContainer = function(shadowId, functionIid) {
            var fIid = functionIid;
            var argumentContainer = this.mapShadowIdsArgumentContainer[
                getHashForShadowIdAndFunctionIid(shadowId, fIid)
            ];

            var functionContainer = null;
            while(!argumentContainer && fIid) {
                functionContainer = this.runTimeInfo[fIid];

                argumentContainer = this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionIid(shadowId, fIid)
                ];

                if (!functionContainer) {
                    fIid = null;
                } else {
                    fIid = functionContainer.declarationEnclosingFunctionId;
                }
            }

            return argumentContainer;
        };
	}

	exp.ArgumentContainerFinder = ArgumentContainerFinder;

})(module.exports);