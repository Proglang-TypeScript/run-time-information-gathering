/* global module */
/* global require */

"use strict";

(function(exp) {
	var getHashForShadowIdAndFunctionId = require("./getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	function ArgumentContainerFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
        this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsArgumentContainer = {};

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

        this.addMappingForContainers = function(argumentContainer, functionContainer, val) {
            var shadowId = this.sMemoryInterface.getShadowIdOfObject(val);

            if (shadowId) {
                this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionId(
                        shadowId,
                        functionContainer.functionId
                    )
                ] = functionContainer.getArgumentContainer(argumentContainer.argumentIndex);
            }
        };
	}

	exp.ArgumentContainerFinder = ArgumentContainerFinder;

})(module.exports);