/* global module */
/* global require */

"use strict";

(function(exp) {
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var addDeclarationFunctionIdToFunctionsInsideObject = require("../../utils/addDeclarationFunctionIdToFunctionsInsideObject.js").addDeclarationFunctionIdToFunctionsInsideObject;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function PutFieldPre(functionsExecutionStack, sMemoryInterface, argumentContainerFinder, mapShadowIdsInteractions) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		var dis = this;

		this.runCallback = function(iid, base, offset, val, isComputed, isOpAssign) {
			var functionIid = this.functionsExecutionStack.getCurrentExecutingFunction();
			val = addDeclarationEnclosingFunctionId(val);

			if (offset !== undefined && functionIid) {
				var shadowId = this.sMemoryInterface.getShadowIdOfObject(base);
				var argumentContainer = argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

				if (argumentContainer) {
					argumentContainer.addInteraction(
						getPutFieldInteracion(offset, val, isComputed, isOpAssign, functionIid)
					);
				} else {
					var mappedInteraction = dis.mapShadowIdsInteractions[
						getHashForShadowIdAndFunctionIid(
							shadowId,
							functionIid
						)
					];

					if (mappedInteraction) {
						if (!mappedInteraction.hasOwnProperty("followingInteractions")) {
							mappedInteraction.followingInteractions = [];
						}

						mappedInteraction.followingInteractions.push(
							getPutFieldInteracion(offset, val, isComputed, isOpAssign, functionIid)
						);
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

		function addDeclarationEnclosingFunctionId(val) {
			if (getTypeOf(val) == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
			} else {
				val = addDeclarationFunctionIdToFunctionsInsideObject(
					val,
					dis.functionsExecutionStack
				);
			}

			return val;
		}

		function getPutFieldInteracion(offset, val, isComputed, isOpAssign, functionIid) {
			return {
				code: 'setField',
				field: offset,
				typeof: getTypeOf(val),
				isComputed: isComputed,
				isOpAssign: isOpAssign,
				enclosingFunctionId: functionIid
			};
		}
	}

	exp.PutFieldPre = PutFieldPre;

})(module.exports);