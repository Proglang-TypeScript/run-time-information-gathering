/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("./getTypeOf.js").getTypeOf;

	function SMemoryInterface(sMemory) {
		this.sMemory = sMemory;

		this.getShadowIdOfObject = function(obj) {
			if (getTypeOf(obj) !== "object") {
				return null;
			}

			var shadowObj = this.sMemory.getShadowObjectOfObject(obj);
			return this.sMemory.getIDFromShadowObjectOrFrame(shadowObj);
		};

		this.getSpecialPropActual = function() {
			return this.sMemory.getSpecialPropActual();
		};

		this.getSpecialPropSObject = function() {
			return this.sMemory.getSpecialPropSObject();
		};
	}

	exp.SMemoryInterface = SMemoryInterface;

})(module.exports);