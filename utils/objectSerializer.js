/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("./getTypeOf.js").getTypeOf;

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

	exp.ObjectSerializer = ObjectSerializer;

})(module.exports);