/* global J$ */

"use strict";

(function (sandbox) {
	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object" && val instanceof Array) {
			return "array";
		}

		return typeof val;
	}

	function getTypeOfForReporting(val) {
		var argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;

		if (getTypeOf(val) == "object") {
			if (val[argumentWrapperObjectBuilder.getOriginalTypeOfField()]) {
				return val[argumentWrapperObjectBuilder.getOriginalTypeOfField()];
			}

			if(val.constructor && val.constructor.name !== "Object") {
				return val.constructor.name;
			}
		}

		return getTypeOf(val);
	}

	function getDeclarationEnclosingFunctionId(functionsExecutionStack) {
		if (!functionsExecutionStack.isThereAFunctionExecuting()) {
			return -1;
		}

		return functionsExecutionStack.getCurrentExecutingFunction();
	}

	function addDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack, sMemoryInterface) {
		function propertyIsWritable(obj, key) {
			let description =  Object.getOwnPropertyDescriptor(obj, key);

			return (description !== undefined && description.writable === true);
		}

		if (getTypeOf(val) == "object") {
			for (var key in val) {
				if (propertyIsWritable(val, key)) {
					if (getTypeOf(val[key]) == "function") {
						val[key].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(functionsExecutionStack);
					}

					if (key !== sMemoryInterface.getSpecialPropActual()) { // avoid circular reference
						val[key] = addDeclarationFunctionIdToFunctionsInsideObject(
							val[key],
							functionsExecutionStack,
							sMemoryInterface
						);
					}
				}
			}
		}

		return val;
	}

	function getHashForShadowIdAndFunctionId(shadowId, functionId) {
		return shadowId + " - " + functionId;
	}

	function getRandomIdentifier() {
		var now = new Date();
		return Math.floor((Math.random() * 1000) + 1).toString() + now.getTime();
	}

	sandbox.functions = {
		getTypeOf: getTypeOf,
		getTypeOfForReporting: getTypeOfForReporting,
		getDeclarationEnclosingFunctionId: getDeclarationEnclosingFunctionId,
		addDeclarationFunctionIdToFunctionsInsideObject: addDeclarationFunctionIdToFunctionsInsideObject,
		getHashForShadowIdAndFunctionId: getHashForShadowIdAndFunctionId,
		getRandomIdentifier: getRandomIdentifier,
	};
}(J$));