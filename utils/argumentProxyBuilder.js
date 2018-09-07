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
							if (typeof target[property] === "function" && property !== "constructor") {
								if (!receiver[property + this.uniqueShadowObjectKey]) {
									const origMethod = target[property];
									var f = function() {
										const result = origMethod.apply(target, arguments);
										return result;
									};

									for(var key in origMethod) {
										if (origMethod.hasOwnProperty(key)) {
											f[key] = origMethod[key];
										}
									}

									f.isProxy = true;

									target[property + this.uniqueShadowObjectKey] = f;
									origMethod.proxyMethod = f;
								}

								return target[property + this.uniqueShadowObjectKey];
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

			if (obj instanceof RegExp) {
				obj.exec = obj.exec.bind(obj);
			}

			return p;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentProxyBuilder = new ArgumentProxyBuilder(sandbox.utils.sMemoryInterface);
}(J$));