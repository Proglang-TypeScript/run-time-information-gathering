/* global module */
/* global require */

"use strict";

(function(exp) {
	var getRandomIdentifier = require("../../utils/getRandomIdentifier.js").getRandomIdentifier;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	var MethodCallInteraction = require("../../utils/interactions/methodCallInteraction.js").MethodCallInteraction;
	var GetFieldInteraction = require("../../utils/interactions/getFieldInteraction.js").GetFieldInteraction;

	function GetFieldPre(
		functionsExecutionStack,
		mapMethodIdentifierInteractions,
		sMemoryInterface,
		argumentContainerFinder,
		interactionFinder,
		recursiveInteractionsHandler,
		mapShadowIdsInteractions
	) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.interactionFinder = interactionFinder;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		var dis = this;

		this.runCallback = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
		) {
			if (isMethodCall === true) {
				processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid);
			} else {
				processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid);
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};

		function processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var getFieldInteraction = getGetFieldInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			processRecursiveInteractionOfResult(
				getFieldInteraction,
				base[offset],
				dis.functionsExecutionStack.getCurrentExecutingFunction()
			);

			if (!addInteractionToArgumentContainerIfPossible(getFieldInteraction, base)) {
				addRecursiveFollowingInteraction(
					getFieldInteraction,
					base[offset],
					dis.functionsExecutionStack.getCurrentExecutingFunction(),
					dis.sMemoryInterface.getShadowIdOfObject(base)
				);
			}
		}

		function processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			base[offset].methodName = offset;

			var methodCallInteraction = getMethodCallInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			addRandomIdentifierToMethodCall(methodCallInteraction, base[offset]);
			addInteractionToArgumentContainerIfPossible(methodCallInteraction, base);
		}

		function addInteractionToArgumentContainerIfPossible(interaction, base) {
			var functionIid = dis.functionsExecutionStack.getCurrentExecutingFunction();
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

			var interactionAdded = false;
			if (functionIid && argumentContainer) {
				argumentContainer.addInteraction(interaction);
				interactionAdded = true;
			}

			return interactionAdded;
		}

		function getGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new GetFieldInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			interaction.setReturnTypeOf(base[offset]);

			return interaction;
		}

		function processRecursiveInteractionOfResult(interaction, result, functionIid) {
			if (getTypeOf(result) == "object") {
				var shadowIdReturnedObject = dis.sMemoryInterface.getShadowIdOfObject(result);

				dis.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionIid(
						shadowIdReturnedObject,
						functionIid
					)
				] = interaction;

				dis.recursiveInteractionsHandler.associateMainInteractionToCurrentInteraction(interaction, result);
			}
		}

		function getMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new MethodCallInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}

		function addRandomIdentifierToMethodCall(interaction, f) {
			var randomIdentifier = getRandomIdentifier();
			f.methodIdentifier = randomIdentifier;
			dis.mapMethodIdentifierInteractions[randomIdentifier] = interaction;
		}

		function addRecursiveFollowingInteraction(interaction, result, functionIid, shadowIdBaseObject) {
			var mappedInteraction = dis.interactionFinder.findInteraction(
				shadowIdBaseObject,
				functionIid
			);

			if (mappedInteraction) {
				if (!dis.recursiveInteractionsHandler.interactionAlreadyUsed(interaction, result)) {
					mappedInteraction = dis.recursiveInteractionsHandler.getMainInteractionForCurrentInteraction(mappedInteraction);
					mappedInteraction.addFollowingInteraction(interaction);

					dis.recursiveInteractionsHandler.reportUsedInteraction(interaction, result);
				}
			}
		}
	}

	exp.GetFieldPre = GetFieldPre;

})(module.exports);