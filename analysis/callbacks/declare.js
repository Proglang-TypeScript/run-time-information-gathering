/* global module */
/* global require */

"use strict";

(function(exp) {
	var ArgumentContainer = require("../../utils/argumentContainer.js").ArgumentContainer;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	function Declare(runTimeInfo, functionsExecutionStack, mapShadowIds, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapShadowIds = mapShadowIds;
		this.sMemoryInterface = sMemoryInterface;

		this.runCallback = function(iid, name, val, isArgument, argumentIndex) {
			if (argumentIndex >= 0 && isArgument === true && this.functionsExecutionStack.getCurrentExecutingFunction()) {
				var functionIid = this.functionsExecutionStack.getCurrentExecutingFunction();
				var functionContainer = this.runTimeInfo[functionIid];

				if (functionContainer) {
					var argumentContainer = new ArgumentContainer(argumentIndex, name);
					argumentContainer.shadowId = this.sMemoryInterface.getShadowIdOfObject(val);

					var inputValueInteraction = {
						code: "inputValue",
						typeof: getTypeOf(val)
					};

					argumentContainer.addInteraction(inputValueInteraction);
					functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

					if (argumentContainer.shadowId) {
						this.mapShadowIds[
						getHashForShadowIdAndFunctionIid(
							argumentContainer.shadowId,
							functionIid
							)
						] = functionContainer.getArgumentContainer(argumentIndex);
					}
				}
			}

			if (typeof val == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(functionsExecutionStack);
			}

			return {
				result: val
			};
		};
	}

	exp.Declare = Declare;

})(module.exports);