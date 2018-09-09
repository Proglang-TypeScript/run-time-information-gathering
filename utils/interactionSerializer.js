/* global J$ */

"use strict";

(function (sandbox) {
	function InteractionSerializer(objectSerializer) {
		this.objectSerializer = objectSerializer;

		this.serialize = function(interaction, obj) {
			var interactionKey = stringify(interaction);
			var objSerialized = this.objectSerializer.serializeStructure(obj);

			return interactionKey + "|" + objSerialized;
		};

		function stringify(o) {
			var cache = [];
			let s = JSON.stringify(o, function(key, value) {
				if (typeof value === 'object' && value !== null) {
					if (cache.indexOf(value) !== -1) {
						return;
					}

					cache.push(value);
				}

				return value;
			});

			cache = null;
			return s;
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionSerializer = new InteractionSerializer(sandbox.utils.objectSerializer);
}(J$));