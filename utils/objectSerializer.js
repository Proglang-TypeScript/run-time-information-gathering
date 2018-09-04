/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOf = sandbox.functions.getTypeOf;

	function ObjectSerializer(smemoryInterface) {
		this.smemoryInterface = smemoryInterface;

		var dis = this;

		this.serializeStructure = function(obj) {
			var objSerialized = "";

			if (getTypeOf(obj) == "object") {
				var objKeys = Object.keys(obj).sort().filter(function(elem) {
					return !elem.startsWith(dis.smemoryInterface.getSpecialPropSObject());
				});

				objSerialized = JSON.stringify(objKeys);
				objSerialized += "__constructorName__: " + obj.constructor.name;
			}

			return objSerialized;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.objectSerializer = new ObjectSerializer(sandbox.utils.sMemoryInterface);
}(J$));