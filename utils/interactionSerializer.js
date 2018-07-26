/* global module */

"use strict";

(function(exp) {
	function InteractionSerializer(objectSerializer) {
		this.objectSerializer = objectSerializer;

		this.serialize = function(interaction, obj) {
			var interactionKey = JSON.stringify(interaction);
			var objSerialized = this.objectSerializer.serializeStructure(obj);

			return interactionKey + "|" + objSerialized;
		};
	}

	exp.InteractionSerializer = InteractionSerializer;

})(module.exports);