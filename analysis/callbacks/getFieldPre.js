/* global module */
/* global require */

"use strict";

(function(exp) {
	var getRandomIdentifier = require("../../utils/getRandomIdentifier.js").getRandomIdentifier;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;
	var RecursiveInteractionsHandler = require("../../utils/recursiveInteractionsHandler.js").RecursiveInteractionsHandler;

	function GetFieldPre(
		functionsExecutionStack,
		mapMethodIdentifierInteractions,
		sMemoryInterface,
		argumentContainerFinder,
		interactionFinder,
		mapShadowIdsInteractions
	) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.interactionFinder = interactionFinder;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.recursiveInteractionsHandler = new RecursiveInteractionsHandler(this.sMemoryInterface);

		var dis = this;

		this.runCallback = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
		) {
			var functionIid = this.functionsExecutionStack.getCurrentExecutingFunction();
			var shadowId = this.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = this.argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

			if (isMethodCall === true) {
				base[offset].methodName = offset;
			}

			if (functionIid && argumentContainer) {
				var interaction = getInteraction(
					base,
					offset,
					functionIid,
					isMethodCall,
					isComputed,
					isOpAssign,
					iid
				);

				argumentContainer.addInteraction(interaction);
			} else {
				var mappedInteraction = this.interactionFinder.findInteraction(
					shadowId,
					functionIid
				);

				if (mappedInteraction) {
					var followingInteraction = getInteraction(
						base,
						offset,
						functionIid,
						isMethodCall,
						isComputed,
						isOpAssign,
						iid
					);

					if (!this.recursiveInteractionsHandler.interactionAlreadyUsed(followingInteraction, base[offset])) {
						mappedInteraction = this.recursiveInteractionsHandler.getMainInteractionForCurrentInteraction(mappedInteraction);

						addFollowingInteraction(mappedInteraction, followingInteraction);

						this.recursiveInteractionsHandler.reportUsedInteraction(followingInteraction, base[offset]);
					}
				}
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};

		function getInteraction(base, offset, functionIid, isMethodCall, isComputed, isOpAssign, iid) {
			var interaction = {};

			if (isMethodCall === false) {
					interaction = {
						iid: iid,
						code: 'getField',
						field: offset,
						isComputed: isComputed,
						isOpAssign: isOpAssign,
						isMethodCall: isMethodCall,
						enclosingFunctionId: functionIid,
						returnTypeOf: getTypeOf(base[offset])
					};

					if (getTypeOf(base[offset]) == "object") {
						var shadowIdReturnedObject = dis.sMemoryInterface.getShadowIdOfObject(base[offset]);

						dis.mapShadowIdsInteractions[
							getHashForShadowIdAndFunctionIid(
								shadowIdReturnedObject,
								functionIid
							)
						] = interaction;

						dis.recursiveInteractionsHandler.associateMainInteractionToCurrentInteraction(interaction, base[offset]);
					}
			} else {
				interaction = {
					iid: iid,
					code: 'methodCall',
					methodName: offset,
					isComputed: isComputed,
					isOpAssign: isOpAssign,
					isMethodCall: isMethodCall,
					functionIid: null,
					enclosingFunctionId: functionIid,
				};

				var randomIdentifier = getRandomIdentifier();
				base[offset].methodIdentifier = randomIdentifier;
				dis.mapMethodIdentifierInteractions[randomIdentifier] = interaction;
			}

			return interaction;
		}

		function addFollowingInteraction(baseInteraction, followingInteraction) {
			if (!baseInteraction.hasOwnProperty("followingInteractions")) {
				baseInteraction.followingInteractions = [];
			}

			baseInteraction.followingInteractions.push(followingInteraction);
		}
	}

	exp.GetFieldPre = GetFieldPre;

})(module.exports);