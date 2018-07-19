/* global module */
/* global require */

"use strict";

(function(exp) {
	var ObjectSerializer = require("./objectSerializer.js").ObjectSerializer;

	function InteractionSerializer() {
		this.objectSerializer = new ObjectSerializer();

		this.serialize = function(interaction, obj) {
			var interactionKey = JSON.stringify(interaction);
			var objSerialized = this.objectSerializer.serializeStructure(obj);

			return interactionKey + "|" + objSerialized;
		};
	}

	exp.InteractionSerializer = InteractionSerializer;

})(module.exports);