/* global J$ */

"use strict";

(function (sandbox) {
	function ArgumentContainerFinder(sMemoryInterface) {
        this.sMemoryInterface = sMemoryInterface;

        this.mapShadowIdsArgumentContainer = {};

        this.findArgumentContainer = function(shadowId, functionId) {
            return this.mapShadowIdsArgumentContainer[shadowId];
        };

        this.addMappingForContainers = function(argumentContainer, val) {
            var shadowId = this.sMemoryInterface.getShadowIdOfObject(val);

            if (shadowId) {
                this.mapShadowIdsArgumentContainer[shadowId] = argumentContainer;
            }
        };
	}

    if (sandbox.utils === undefined) {
        sandbox.utils = {};
    }

    sandbox.utils.argumentContainerFinder = new ArgumentContainerFinder(sandbox.utils.sMemoryInterface);
}(J$));