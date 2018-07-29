/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function InvokeFun(runTimeInfo, sMemoryInterface, recursiveInteractionsHandler, interactionFinder, functionsExecutionStack, mapMethodIdentifierInteractions, mapShadowIdsInteractions) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.interactionFinder = interactionFinder;
		this.functionsExecutionStack = functionsExecutionStack;

		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			result,
			isConstructor,
			isMethod,
			functionIid
		) {

			var functionContainer = getFunctionContainer(functionIid);

			if (functionContainer) {
				functionContainer.addReturnTypeOf(result);

				if (f.methodIdentifier && (f.methodIdentifier in this.mapMethodIdentifierInteractions)) {
					var interaction = this.mapMethodIdentifierInteractions[f.methodIdentifier];
					interaction.setReturnTypeOf(result);

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

		function getFunctionContainer(functionIid) {
			return dis.runTimeInfo[functionIid];
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

	exp.InvokeFun = InvokeFun;

})(module.exports);