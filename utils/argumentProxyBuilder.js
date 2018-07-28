/* global module */
/* global require */

"use strict";

(function(exp) {
	var getRandomIdentifier = require("./getRandomIdentifier.js").getRandomIdentifier;

	function ArgumentProxyBuilder(sMemoryInterface) {
		this.sMemoryInterface = sMemoryInterface;

		let shadowObjectKey = this.sMemoryInterface.getSpecialPropSObject();

		this.buildProxy = function(obj) {
			return new Proxy(
				obj,
				{
					uniqueShadowObjectKey: shadowObjectKey + "__PROXY__" + getRandomIdentifier(),
					set: function(target, property, value, receiver) {
						if (property === shadowObjectKey) {
							receiver[this.uniqueShadowObjectKey] = value;
						}
						else {
							target[property] = value;
						}

						return true;
					},
					get: function(target, property, receiver) {
						if (property === shadowObjectKey) {
							return receiver[this.uniqueShadowObjectKey];
						} else {
							return target[property];
						}
					},
					getOwnPropertyDescriptor: function(target, property) {
						if (property === shadowObjectKey) {
							var description = Object.getOwnPropertyDescriptor(target, this.uniqueShadowObjectKey);

							return description;
						}
						else {
							return Object.getOwnPropertyDescriptor(target, property);
						}
					}
				}
			);
		};
	}

	exp.ArgumentProxyBuilder = ArgumentProxyBuilder;

})(module.exports);