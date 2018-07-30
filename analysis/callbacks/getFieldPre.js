/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionId = require("../../utils/getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	var MethodCallInteraction = require("../../utils/interactions/methodCallInteraction.js").MethodCallInteraction;
	var GetFieldInteraction = require("../../utils/interactions/getFieldInteraction.js").GetFieldInteraction;

	function GetFieldPre(
		functionsExecutionStack,
		sMemoryInterface,
		argumentContainerFinder,
		interactionFinder,
		recursiveInteractionsHandler,
		functionIdHandler,
		mapShadowIdsInteractions
	) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.interactionFinder = interactionFinder;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.functionIdHandler = functionIdHandler;
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

			addFunctionIdToInteraction(methodCallInteraction, base[offset]);
			addInteractionToArgumentContainerIfPossible(methodCallInteraction, base);
		}

		function addInteractionToArgumentContainerIfPossible(interaction, base) {
			var functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, functionId);

			var interactionAdded = false;
			if (functionId && argumentContainer) {
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

		function processRecursiveInteractionOfResult(interaction, result, functionId) {
			if (getTypeOf(result) == "object") {
				var shadowIdReturnedObject = dis.sMemoryInterface.getShadowIdOfObject(result);

				dis.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionId(
						shadowIdReturnedObject,
						functionId
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

		function addFunctionIdToInteraction(interaction, f) {
			let functionId = dis.functionIdHandler.setFunctionId(f);

			interaction.functionId = functionId;
			f.lastInteraction = interaction;
		}

		function addRecursiveFollowingInteraction(interaction, result, functionId, shadowIdBaseObject) {
			var mappedInteraction = dis.interactionFinder.findInteraction(
				shadowIdBaseObject,
				functionId
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