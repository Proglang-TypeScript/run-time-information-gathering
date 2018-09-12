/* global module */
/* global require */

"use strict";

(function(exp) {
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	var UsedAsArgumentInteraction = require("../../utils/interactions/usedAsArgumentInteraction.js").UsedAsArgumentInteraction;

	function InvokeFunPre(
		runTimeInfo,
		functionsExecutionStack,
		sMemoryInterface,
		argumentContainerFinder,
		functionIdHandler,
		wrapperObjectsHandler
	) {

		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.functionIdHandler = functionIdHandler;
		this.wrapperObjectsHandler = wrapperObjectsHandler;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			if ((f !== undefined) && !isConsoleLog(f)) {
				this.functionIdHandler.setFunctionId(f);

				for (var argIndex in args) {
					addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
					addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);
					convertToWrapperObjectIfItIsALiteral(args, argIndex);
					convertToProxyIfItIsAnObject(args, argIndex);
				}

				if (functionNotProcessed(f)) {
					var functionContainer = new FunctionContainer(f, isConstructor);
					functionContainer.functionIid = functionIid;

					this.runTimeInfo[functionContainer.functionId] = functionContainer;
				}
			}

			return {
				f: f,
				base: base,
				args: args,
				skip: (f === undefined)
			};
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}

		function isConsoleLog(f) {
			return ((f.name === "bound consoleCall") || ((f.name === "log") && f.toString().indexOf("native code") !== -1));
		}

		function addDeclarationEnclosingFunctionIdIfApplicable(val) {
			if (getTypeOf(val) == "function") {
				if (!val.declarationEnclosingFunctionId) {
					val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
				}
			}
		}

		function addUsedAsArgumentInteractionIfApplicable(val, f, argIndex) {
			let functionId = dis.functionIdHandler.getFunctionId(f);

			if (getTypeOf(val) == "object") {
				var currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();
				var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

				var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, currentActiveFiid);
				if (currentActiveFiid && argumentContainer) {
					var usedAsArgumentInteraction = new UsedAsArgumentInteraction(
						currentActiveFiid,
						functionId,
						argIndex
					);

					argumentContainer.addInteraction(usedAsArgumentInteraction);
				}
			}
		}

		function convertToWrapperObjectIfItIsALiteral(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.convertToWrapperObjectIfItIsALiteral(args[argIndex]);
		}

		function convertToProxyIfItIsAnObject(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.convertToProxyIfItIsAnObject(args[argIndex]);
		}
	}

	exp.InvokeFunPre = InvokeFunPre;

})(module.exports);