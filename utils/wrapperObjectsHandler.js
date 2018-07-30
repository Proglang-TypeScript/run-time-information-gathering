/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("./getTypeOf.js").getTypeOf;

	function WrapperObjectsHandler(
		sMemoryInterface,
		argumentWrapperObjectBuilder,
		argumentProxyBuilder
	) {
		this.sMemoryInterface = sMemoryInterface;
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;
		this.argumentProxyBuilder = argumentProxyBuilder;

		this.mapWrapperObjectsOriginalValues = {};

		var dis = this;

		this.objectIsWrapperObject = function(obj) {
			let shadowId = this.sMemoryInterface.getShadowIdOfObject(obj);

			return (shadowId in this.mapWrapperObjectsOriginalValues);
		};

		this.getRealValueFromWrapperObject = function(obj) {
			let shadowId = this.sMemoryInterface.getShadowIdOfObject(obj);

			return this.mapWrapperObjectsOriginalValues[shadowId];
		};

		this.convertToWrapperObjectIfItIsALiteral = function(originalValue) {
			let newValue;

			switch(getTypeOf(originalValue)) {
				case "string":
					newValue = dis.argumentWrapperObjectBuilder.buildFromString(originalValue);
					break;

				case "number":
					newValue = dis.argumentWrapperObjectBuilder.buildFromNumber(originalValue);
					break;
			}

			if (newValue) {
				let shadowIdProxy = dis.sMemoryInterface.getShadowIdOfObject(newValue);
				dis.mapWrapperObjectsOriginalValues[shadowIdProxy] = originalValue;
			} else {
				newValue = originalValue;
			}

			return newValue;
		};

		this.convertToProxyIfItIsAnObject = function(originalValue) {
			let newValue;

			if (getTypeOf(originalValue) == "object" && !(originalValue instanceof String) && !(originalValue instanceof Number)) {
				newValue = dis.argumentProxyBuilder.buildProxy(originalValue);

				var shadowIdProxy = dis.sMemoryInterface.getShadowIdOfObject(newValue);
				dis.mapWrapperObjectsOriginalValues[shadowIdProxy] = originalValue;
			}

			if (!newValue) {
				newValue = originalValue;
			}

			return newValue;
		};
	}

	exp.WrapperObjectsHandler = WrapperObjectsHandler;

})(module.exports);