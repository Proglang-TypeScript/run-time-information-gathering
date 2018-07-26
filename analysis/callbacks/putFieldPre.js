/* global module */
/* global require */

"use strict";

(function(exp) {
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;

	var PutFieldInteraction = require("../../utils/interactions/putFieldInteraction.js").PutFieldInteraction;

	function PutFieldPre(
		functionsExecutionStack,
		sMemoryInterface,
		argumentContainerFinder,
		interactionFinder,
		mapShadowIdsInteractions
	) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.interactionFinder = interactionFinder;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		var dis = this;

		this.runCallback = function(iid, base, offset, val, isComputed, isOpAssign) {
			val = addDeclarationEnclosingFunctionId(val);

			var interaction = getPutFieldInteracion(
				iid,
				offset,
				val,
				isComputed,
				isOpAssign
			);

			if (!addInteractionToArgumentContainerIfPossible(interaction, base)) {
				addFollowingInteractionToMappedInteraction(interaction, base);
			}

			return {
				base: base,
				offset: offset,
				val: val,
				skip: false
			};
		};

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

		function addFollowingInteractionToMappedInteraction(interaction, base) {
			var mappedInteraction = dis.interactionFinder.findInteraction(
				dis.sMemoryInterface.getShadowIdOfObject(base),
				dis.functionsExecutionStack.getCurrentExecutingFunction()
			);

			if (mappedInteraction) {
				mappedInteraction.addFollowingInteraction(interaction);
			}
		}

		function addDeclarationEnclosingFunctionId(val) {
			if (getTypeOf(val) == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
			} else {
				val = addDeclarationFunctionIdToFunctionsInsideObject(
					val,
					dis.functionsExecutionStack,
					dis.sMemoryInterface
				);
			}

			return val;
		}

		function getPutFieldInteracion(iid, offset, val, isComputed, isOpAssign) {
			var interaction = new PutFieldInteraction(iid, offset);

			interaction.typeof = getTypeOf(val);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}
	}

	exp.PutFieldPre = PutFieldPre;

})(module.exports);