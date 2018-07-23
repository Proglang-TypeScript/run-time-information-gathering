/* global module */
/* global require */

"use strict";

(function(exp) {
	var ArgumentContainer = require("../../utils/argumentContainer.js").ArgumentContainer;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	var InputValueInteraction = require("../../utils/interactions/inputValueInteraction.js").InputValueInteraction;

	function Declare(runTimeInfo, functionsExecutionStack, mapShadowIds, sMemoryInterface) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapShadowIds = mapShadowIds;
		this.sMemoryInterface = sMemoryInterface;

		this.runCallback = function(iid, name, val, isArgument, argumentIndex) {
			if (isAnArgumentOfAProcessedFunction(argumentIndex, isArgument)) {
				var functionContainer = getFunctionContainer();

				if (functionContainer) {
					var argumentContainer = buildArgumentContainer(argumentIndex, name, val);
					functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

					addMappingForContainers(argumentContainer, functionContainer, val);
				}
			}

			if (typeof val == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(functionsExecutionStack);
			}

			return {
				result: val
			};

		};

		function isAnArgumentOfAProcessedFunction(argumentIndex, isArgument) {
			return (
				argumentIndex >= 0 &&
				isArgument === true &&
				dis.functionsExecutionStack.isThereAFunctionExecuting()
			);
		}

		function getFunctionContainer() {
			var functionIid = dis.functionsExecutionStack.getCurrentExecutingFunction();
			return dis.runTimeInfo[functionIid];
		}

		function buildArgumentContainer(argumentIndex, name, val) {
			var argumentContainer = new ArgumentContainer(argumentIndex, name);
			argumentContainer.addInteraction(new InputValueInteraction(getTypeOf(val)));

			return argumentContainer;
		}

		function addMappingForContainers(argumentContainer, functionContainer, val) {
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

			if (shadowId) {
				dis.mapShadowIds[
					getHashForShadowIdAndFunctionIid(
						shadowId,
						functionContainer.functionId
					)
				] = functionContainer.getArgumentContainer(argumentContainer.argumentIndex);
			}
		}
	}

	exp.Declare = Declare;

})(module.exports);