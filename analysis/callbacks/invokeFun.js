/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;

	function InvokeFun(
		runTimeInfo,
		sMemoryInterface,
		recursiveInteractionsHandler,
		interactionFinder,
		functionsExecutionStack,
		argumentWrapperObjectBuilder,
		argumentContainerFinder
	) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.interactionFinder = interactionFinder;
		this.functionsExecutionStack = functionsExecutionStack;
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;
		this.argumentContainerFinder = argumentContainerFinder;

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

				if (f.lastInteraction) {
					var interaction = f.lastInteraction;
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

					if (!addInteractionToArgumentContainerIfPossible(interaction, base)) {
						addRecursiveFollowingInteraction(
							interaction,
							result,
							this.functionsExecutionStack.getCurrentExecutingFunction(),
							this.sMemoryInterface.getShadowIdOfObject(base)
						);
					}
				}
			}

			return {
				result: result
			};
		};

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
				dis.interactionFinder.addMapping(interaction, functionId, result);
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