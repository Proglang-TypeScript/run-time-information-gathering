/* global J$ */

"use strict";

(function (sandbox) {
	var getRandomIdentifier = sandbox.functions.getRandomIdentifier;

	function ArgumentProxyBuilder(sMemoryInterface) {
		this.sMemoryInterface = sMemoryInterface;

		let shadowObjectKey = this.sMemoryInterface.getSpecialPropSObject();

		this.buildProxy = function(obj) {
			let p = new Proxy(
				obj,
				{
					uniqueShadowObjectKey: shadowObjectKey + "__PROXY__" + getRandomIdentifier(),
					set: function(target, property, value, receiver) {
						if (property === shadowObjectKey) {
							Object.defineProperty(receiver, this.uniqueShadowObjectKey, {
								value: value,
								enumerable: false,
								configurable: true,
								writable: true
							});
						}
						else {
							target[property] = value;
						}

						return true;
					},
					get: function(target, property, receiver) {
						if (property === "TARGET_PROXY") {
							return target;
						}

						if (property === shadowObjectKey) {
							return receiver[this.uniqueShadowObjectKey];
						} else {
							if (typeof target[property] === "function" && property !== "constructor") {
								if (!isProxyMethod(target, property)) {
									const origMethod = target[property];
									var f = cloneMethod(origMethod, target);

									target[getModifiedPropertyName(property)] = f;
									origMethod.proxyMethod = f;
								}

								return target[getModifiedPropertyName(property)];
							}

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

			return p;
		};

		function getModifiedPropertyName(property) {
			let pString;

			if (typeof property === "symbol") {
				pString = property.toString();
			} else {
				pString = property;
			}

			return pString + "__PROXY__";
		}

		function cloneMethod(origMethod, target) {
			var f = function() {
				const result = origMethod.apply(target, arguments);
				return result;
			};

			for(var key in origMethod) {
				if (origMethod.hasOwnProperty(key)) {
					f[key] = origMethod[key];
				}
			}

			return f;
		}

		function isProxyMethod(target, property) {
			return (target[getModifiedPropertyName(property)] !== undefined);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentProxyBuilder = new ArgumentProxyBuilder(sandbox.utils.sMemoryInterface);
}(J$));