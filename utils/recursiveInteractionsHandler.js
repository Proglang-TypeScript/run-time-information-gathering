/* global J$ */

"use strict";

(function (sandbox) {
	function RecursiveInteractionsHandler(sMemoryInterface, interactionSerializer) {
		this.sMemoryInterface = sMemoryInterface;

		this.usedInteractions = {};
		this.mapRecursiveMainInteractions = {};

		this.interactionSerializer = interactionSerializer;

		var dis = this;

		this.getMainInteractionForCurrentInteraction = function(interaction) {
			var shadowIdInteraction = this.sMemoryInterface.getShadowIdOfObject(interaction);
			if (
				shadowIdInteraction &&
				shadowIdInteraction in this.mapRecursiveMainInteractions) {

				return this.mapRecursiveMainInteractions[shadowIdInteraction];
			}

			return interaction;
		};

		this.associateMainInteractionToCurrentInteraction = function(interaction, result) {
			if (this.interactionAlreadyUsed(interaction, result)) {
				var shadowIdInteraction = this.sMemoryInterface.getShadowIdOfObject(interaction);
				var interactionKey = getInteractionKey(interaction, result);
				
				this.mapRecursiveMainInteractions[shadowIdInteraction] = this.usedInteractions[interactionKey];
			}
		};

		this.reportUsedInteraction = function(interaction, result) {
			var interactionKey = getInteractionKey(interaction, result);

			this.usedInteractions[interactionKey] = interaction;
		};

		this.interactionAlreadyUsed = function(interaction, result) {
			var interactionKey = getInteractionKey(interaction, result);

			return (interactionKey in this.usedInteractions);
		};

		function getInteractionKey(interaction, obj) {
			return dis.interactionSerializer.serialize(interaction, obj);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.recursiveInteractionsHandler = new RecursiveInteractionsHandler(
		sandbox.utils.sMemoryInterface,
		sandbox.utils.interactionSerializer
	);

}(J$));