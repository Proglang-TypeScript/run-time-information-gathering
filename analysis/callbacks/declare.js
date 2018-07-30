/* global module */
/* global require */

"use strict";

(function(exp) {
	var ArgumentContainer = require("../../utils/argumentContainer.js").ArgumentContainer;
	var getTypeOfForReporting = require("../../utils/getTypeOf.js").getTypeOfForReporting;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	var InputValueInteraction = require("../../utils/interactions/inputValueInteraction.js").InputValueInteraction;

	function Declare(runTimeInfo, functionsExecutionStack, argumentContainerFinder, sMemoryInterface) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.argumentContainerFinder = argumentContainerFinder;
		this.sMemoryInterface = sMemoryInterface;

		this.runCallback = function(iid, name, val, isArgument, argumentIndex) {
			if (isAnArgumentOfAProcessedFunction(argumentIndex, isArgument)) {
				var functionContainer = getFunctionContainer();

				if (functionContainer) {
					var argumentContainer = buildArgumentContainer(argumentIndex, name, val);
					functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

					this.argumentContainerFinder.addMappingForContainers(argumentContainer, functionContainer, val);
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
			let functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			return dis.runTimeInfo[functionId];
		}

		function buildArgumentContainer(argumentIndex, name, val) {
			var argumentContainer = new ArgumentContainer(argumentIndex, name);
			argumentContainer.addInteraction(new InputValueInteraction(getTypeOfForReporting(val)));

			return argumentContainer;
		}
	}

	exp.Declare = Declare;

})(module.exports);