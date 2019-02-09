/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOf = sandbox.functions.getTypeOf;

	function InteractionWithResultHandler(
		interactionFinder,
		recursiveInteractionsHandler,
		sMemoryInterface,
		argumentContainerFinder
	) {

		this.interactionFinder = interactionFinder;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

		var dis = this;

		this.processInteractionWithResult = function(interaction, functionId, result, base) {
			if (getTypeOf(result) == "object") {
				dis.interactionFinder.addMapping(interaction, functionId, result);
				dis.recursiveInteractionsHandler.associateMainInteractionToCurrentInteraction(
					interaction,
					result
				);
			}

			if (!addInteractionToContainerIfPossible(interaction, base)) {
				addFollowingInteraction(
					interaction,
					result,
					dis.sMemoryInterface.getShadowIdOfObject(base)
				);
			}
		};

		function addInteractionToContainerIfPossible(interaction, base) {
			let shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			let containerForAddingNewInteraction = dis.argumentContainerFinder.findArgumentContainer(shadowId);

			let interactionAdded = false;
			if (containerForAddingNewInteraction) {
				containerForAddingNewInteraction.addInteraction(interaction);
				interactionAdded = true;
			}

			return interactionAdded;
		}

		function addFollowingInteraction(interaction, result, shadowIdBaseObject) {
			var containerForAddingNewInteraction = dis.interactionFinder.findInteraction(shadowIdBaseObject);

			if (containerForAddingNewInteraction) {
				if (!dis.recursiveInteractionsHandler.interactionAlreadyUsed(interaction, result)) {
					containerForAddingNewInteraction = dis.recursiveInteractionsHandler.getMainInteractionForCurrentInteraction(containerForAddingNewInteraction);
					containerForAddingNewInteraction.addFollowingInteraction(interaction);

					dis.recursiveInteractionsHandler.reportUsedInteraction(interaction, result);
				}
			}
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionWithResultHandler = new InteractionWithResultHandler(
		sandbox.utils.interactionFinder,
		sandbox.utils.recursiveInteractionsHandler,
		sandbox.utils.sMemoryInterface,
		sandbox.utils.argumentContainerFinder
	);

}(J$));