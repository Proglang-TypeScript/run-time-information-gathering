/* global J$ */

"use strict";

(function (sandbox) {
	function InteractionSerializer(objectSerializer) {
		this.objectSerializer = objectSerializer;

		this.serialize = function(interaction, obj) {
			var interactionKey = JSON.stringify(interaction);
			var objSerialized = this.objectSerializer.serializeStructure(obj);

			return interactionKey + "|" + objSerialized;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionSerializer = new InteractionSerializer(sandbox.utils.objectSerializer);
}(J$));