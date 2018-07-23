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
			var functionIid = this.functionsExecutionStack.getCurrentExecutingFunction();
			val = addDeclarationEnclosingFunctionId(val);

			if (offset !== undefined && functionIid) {
				var shadowId = this.sMemoryInterface.getShadowIdOfObject(base);
				var argumentContainer = argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

				var interaction = getPutFieldInteracion(iid, offset, val, isComputed, isOpAssign, functionIid);
				if (argumentContainer) {
					argumentContainer.addInteraction(interaction);
				} else {
					var mappedInteraction = this.interactionFinder.findInteraction(
						shadowId,
						functionIid
					);

					if (mappedInteraction) {
						mappedInteraction.addFollowingInteraction(interaction);
					}
				}
			}

			return {
				base: base,
				offset: offset,
				val: val,
				skip: false
			};
		};

		function addDeclarationEnclosingFunctionId(val) {
			if (getTypeOf(val) == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
			} else {
				val = addDeclarationFunctionIdToFunctionsInsideObject(
					val,
					dis.functionsExecutionStack
				);
			}

			return val;
		}

		function getPutFieldInteracion(iid, offset, val, isComputed, isOpAssign, functionIid) {
			var interaction = new PutFieldInteraction(iid, offset);

			interaction.typeof = getTypeOf(val);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = functionIid;

			return interaction;
		}
	}

	exp.PutFieldPre = PutFieldPre;

})(module.exports);