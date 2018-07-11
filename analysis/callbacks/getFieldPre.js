/* global module */
/* global require */

"use strict";

(function(exp) {
	var getRandomIdentifier = require("../../utils/getRandomIdentifier.js").getRandomIdentifier;

	function GetFieldPre(functionsExecutionStack, mapMethodIdentifierInteractions, sMemoryInterface, argumentContainerFinder) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

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
				var interaction = {};

				if (isMethodCall === false) {
					interaction = {
						code: 'getField',
						field: offset,
						isComputed: isComputed,
						isOpAssign: isOpAssign,
						isMethodCall: isMethodCall,
						enclosingFunctionId: functionIid
					};
				} else {
					interaction = {
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
					this.mapMethodIdentifierInteractions[randomIdentifier] = interaction;
				}

				argumentContainer.addInteraction(interaction);
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};
	}

	exp.GetFieldPre = GetFieldPre;

})(module.exports);