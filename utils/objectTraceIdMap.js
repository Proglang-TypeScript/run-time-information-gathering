/* global J$ */

"use strict";

(function (sandbox) {
	function ObjectTraceIdMap(sMemoryInterface) {
        this.sMemoryInterface = sMemoryInterface;

        let dis = this;
        let myMap = new Map();

        this.set = function(obj, traceId) {
            let shadowId = dis.sMemoryInterface.getShadowIdOfObject(obj);

            if (shadowId) {
                myMap.set(shadowId, traceId);
            }
        };

        this.get = function(obj) {
            let shadowId = dis.sMemoryInterface.getShadowIdOfObject(obj);

            return myMap.get(shadowId);
        };
	}

    if (sandbox.utils === undefined) {
        sandbox.utils = {};
    }

    sandbox.utils.objectTraceIdMap = new ObjectTraceIdMap(
        sandbox.utils.sMemoryInterface
    );
}(J$));