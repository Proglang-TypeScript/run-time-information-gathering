/* global J$ */

"use strict";

(function (sandbox) {
	function SMemoryInterface(sMemory) {
		this.sMemory = sMemory;

		this.getShadowIdOfObject = function(obj) {
			var shadowObj = this.sMemory.getShadowObjectOfObject(obj);
			var shadowId = this.sMemory.getIDFromShadowObjectOrFrame(shadowObj);

			if (shadowId === undefined) {
				return null;
			}

			return shadowId;
		};

		this.getSpecialPropActual = function() {
			return this.sMemory.getSpecialPropActual();
		};

		this.getSpecialPropSObject = function() {
			return this.sMemory.getSpecialPropSObject();
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.sMemoryInterface = new SMemoryInterface(sandbox.smemory);
}(J$));