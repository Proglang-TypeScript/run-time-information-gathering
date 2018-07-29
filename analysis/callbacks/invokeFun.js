/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionId = require("../../utils/getHashForShadowIdAndFunctionId.js").getHashForShadowIdAndFunctionId;

	function InvokeFun(
		runTimeInfo,
		sMemoryInterface,
		recursiveInteractionsHandler,
		interactionFinder,
		functionsExecutionStack,
		argumentWrapperObjectBuilder,
		mapMethodIdentifierInteractions,
		mapShadowIdsInteractions
	) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.interactionFinder = interactionFinder;
		this.functionsExecutionStack = functionsExecutionStack;
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;

		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			result
		) {

			var functionContainer = getFunctionContainer(f);

			if (functionContainer) {
				functionContainer.addReturnTypeOf(result);

				if (f.methodIdentifier && (f.methodIdentifier in this.mapMethodIdentifierInteractions)) {
					var interaction = this.mapMethodIdentifierInteractions[f.methodIdentifier];
					interaction.setReturnTypeOf(result);

					result = changeResultToWrapperObjectIfItIsALiteral(result);

					processRecursiveInteractionOfResult(
						interaction,
						result,
						this.functionsExecutionStack.getCurrentExecutingFunction()
						// Let variable 'f' be the function that executed the invokeFun() callback.
						// invokeFun() callback is executed after functionExit(),
						// so the current executing function is the function that executed function 'f'.
					);

					addRecursiveFollowingInteraction(
						interaction,
						result,
						this.functionsExecutionStack.getCurrentExecutingFunction(),
						this.sMemoryInterface.getShadowIdOfObject(base)
					);
				}
			}

			return {
				result: result
			};
		};

		function changeResultToWrapperObjectIfItIsALiteral(result) {
			switch(getTypeOf(result)) {
				case "string":
					return dis.argumentWrapperObjectBuilder.buildFromString(result);

				case "number":
					return dis.argumentWrapperObjectBuilder.buildFromNumber(result);

				default:
					return result;
			}
		}

		function getFunctionContainer(f) {
			return dis.runTimeInfo[f.functionId];
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

	exp.InvokeFun = InvokeFun;

})(module.exports);