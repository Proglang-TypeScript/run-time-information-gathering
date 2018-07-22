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
				functionContainer.addReturnTypeOf(getTypeOf(result));

				mapShadowIdOfResultWithInteraction(
					f,
					functionContainer.declarationEnclosingFunctionId,
					result,
					this.functionsExecutionStack.getCurrentExecutingFunction(),
					dis.sMemoryInterface.getShadowIdOfObject(base)
				);
			}

			return {
				result: result
			};
		};

		function getFunctionContainer(functionIid) {
			return dis.runTimeInfo[functionIid];
		}

		function mapShadowIdOfResultWithInteraction(f, mapFunctionIid, result, functionIid, shadowIdBaseObject) {
			if (f.methodIdentifier && (f.methodIdentifier in dis.mapMethodIdentifierInteractions)) {
				var interaction = dis.mapMethodIdentifierInteractions[f.methodIdentifier];

				if (getTypeOf(result) == "object") {
					var shadowIdReturnedObject = dis.sMemoryInterface.getShadowIdOfObject(result);

					dis.mapShadowIdsInteractions[
						getHashForShadowIdAndFunctionIid(
							shadowIdReturnedObject,
							mapFunctionIid
						)
					] = interaction;

					dis.recursiveInteractionsHandler.associateMainInteractionToCurrentInteraction(
						interaction,
						result
					);
				}

				var mappedInteraction = dis.interactionFinder.findInteraction(
					shadowIdBaseObject,
					functionIid
				);

				if (mappedInteraction) {
					if (!dis.recursiveInteractionsHandler.interactionAlreadyUsed(interaction, result)) {
						mappedInteraction = dis.recursiveInteractionsHandler.getMainInteractionForCurrentInteraction(mappedInteraction);
						addFollowingInteraction(mappedInteraction, interaction);

						dis.recursiveInteractionsHandler.reportUsedInteraction(interaction, result);
					}
				}
			}
		}

		function addFollowingInteraction(baseInteraction, followingInteraction) {
			if (!baseInteraction.hasOwnProperty("followingInteractions")) {
				baseInteraction.followingInteractions = [];
			}

			baseInteraction.followingInteractions.push(followingInteraction);
		}

	}

	exp.InvokeFun = InvokeFun;

})(module.exports);