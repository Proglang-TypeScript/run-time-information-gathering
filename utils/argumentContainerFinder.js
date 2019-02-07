/* global J$ */

"use strict";

(function (sandbox) {
	function ArgumentContainerFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
        this.sMemoryInterface = sMemoryInterface;

        this.mapShadowIdsArgumentContainer = {};

        this.findArgumentContainer = function(shadowId, functionId) {
            var fId = functionId;
            var argumentContainer = this.mapShadowIdsArgumentContainer[shadowId];

            var functionContainer = null;
            while(!argumentContainer && fId) {

                functionContainer = this.runTimeInfo[fId];

                argumentContainer = this.mapShadowIdsArgumentContainer[shadowId];

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
                this.mapShadowIdsArgumentContainer[shadowId] = functionContainer.getArgumentContainer(
                    argumentContainer.argumentIndex
                );
            }
        };
	}

    if (sandbox.utils === undefined) {
        sandbox.utils = {};
    }

    sandbox.utils.argumentContainerFinder = new ArgumentContainerFinder(
        sandbox.runTimeInfo,
        sandbox.utils.sMemoryInterface
    );
}(J$));