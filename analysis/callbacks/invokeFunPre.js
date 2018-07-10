/* global module */
/* global require */

"use strict";

(function(exp) {
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	function InvokeFunPre(runTimeInfo, functionsExecutionStack, mapMethodIdentifierInteractions, sMemoryInterface, argumentContainerFinder) {
		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			if (f.methodIdentifier in this.mapMethodIdentifierInteractions) {
				var interaction = this.mapMethodIdentifierInteractions[f.methodIdentifier];
				interaction.functionIid = functionIid;
			}

			for (var argIndex in args) {
				if (getTypeOf(args[argIndex]) == "function") {
					if (!args[argIndex].declarationEnclosingFunctionId) {
						args[argIndex].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
					}
				}

				if (getTypeOf(args[argIndex]) == "object") {
					var currentActiveFiid = this.functionsExecutionStack.getCurrentExecutingFunction();
					var shadowId = this.sMemoryInterface.getShadowIdOfObject(args[argIndex]);

					var argumentContainer = this.argumentContainerFinder.findArgumentContainer(shadowId, currentActiveFiid);
					if (currentActiveFiid && argumentContainer) {
						var usedAsArgumentInteraction = {
							code: 'usedAsArgument',
							enclosingFunctionId: currentActiveFiid,
							targetFunctionId: functionIid,
							argumentIndexInTargetFunction: argIndex
						};

						argumentContainer.addInteraction(usedAsArgumentInteraction);
					}
				}
			}

			if (functionIid && !(functionIid in this.runTimeInfo)) {
				var functionContainer = new FunctionContainer(functionIid, functionName);
				functionContainer.iid = iid;
				functionContainer.isConstructor = isConstructor;
				functionContainer.isMethod = isMethod;
				functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;

				this.runTimeInfo[functionIid] = functionContainer;
			}

			return {
				f: f,
				base: base,
				args: args,
				skip: false
			};
		};
	}

	exp.InvokeFunPre = InvokeFunPre;

})(module.exports);