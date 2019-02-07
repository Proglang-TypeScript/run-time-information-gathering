/* global J$ */

"use strict";

(function (sandbox) {
	function PutFieldPreAnalysis() {
		this.callbackName = "putFieldPre";

		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;
		var getTypeOf = sandbox.functions.getTypeOf;
		var addDeclarationFunctionIdToFunctionsInsideObject = sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

		var PutFieldInteraction = sandbox.utils.PutFieldInteraction;
	
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
		this.interactionFinder = sandbox.utils.interactionFinder;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

		var dis = this;

		this.callback = function(iid, base, offset, val, isComputed, isOpAssign) {
			val = addDeclarationEnclosingFunctionId(val);

			var interaction = getPutFieldInteracion(
				iid,
				base,
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
			var functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId);

			var interactionAdded = false;
			if (functionId && argumentContainer) {
				argumentContainer.addInteraction(interaction);
				interactionAdded = true;
			}

			return interactionAdded;
		}

		function addFollowingInteractionToMappedInteraction(interaction, base) {
			var mappedInteraction = dis.interactionFinder.findInteraction(dis.sMemoryInterface.getShadowIdOfObject(base));

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

		function getPutFieldInteracion(iid, base, offset, val, isComputed, isOpAssign) {
			var interaction = new PutFieldInteraction(iid, offset);

			interaction.typeof = getTypeOf(val);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			let traceId = dis.objectTraceIdMap.get(base);
			if (traceId) {
				interaction.traceId = traceId;
			}

			return interaction;
		}
	}

	sandbox.analysis = new PutFieldPreAnalysis();

}(J$));