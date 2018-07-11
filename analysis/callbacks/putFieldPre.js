/* global module */
/* global require */

"use strict";

(function(exp) {
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;

	function PutFieldPre(functionsExecutionStack, sMemoryInterface, argumentContainerFinder) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

		this.runCallback = function(iid, base, offset, val, isComputed, isOpAssign) {
			var functionIid = this.functionsExecutionStack.getCurrentExecutingFunction();
			if (getTypeOf(val) == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(this.functionsExecutionStack);
			} else {
				val = addDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack);
			}

			if (functionIid) {
				var shadowId = this.sMemoryInterface.getShadowIdOfObject(base);

				var argumentContainer = argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

				if (argumentContainer) {
					if (offset !== undefined) {
						var putFieldInteraction = {
							code: 'setField',
							field: offset,
							typeof: getTypeOf(val),
							isComputed: isComputed,
							isOpAssign: isOpAssign,
							enclosingFunctionId: functionIid
						};

						argumentContainer.addInteraction(putFieldInteraction);
					}
				}
			}

			return {
				base: base,
				offset: offset,
				val: val,
				skip: false
			};
		};
	}

	exp.PutFieldPre = PutFieldPre;

})(module.exports);