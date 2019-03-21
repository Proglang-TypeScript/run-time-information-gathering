/* global J$ */

"use strict";

(function (sandbox) {
	function InvokeFunPreAnalysis() {
		this.callbackName = "invokeFunPre";

		var FunctionContainer = sandbox.utils.FunctionContainer;
		var getTypeOf = sandbox.functions.getTypeOf;
		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

		var UsedAsArgumentInteraction = sandbox.utils.UsedAsArgumentInteraction;

		var dis = this;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
		this.functionIdHandler = sandbox.utils.functionIdHandler;
		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

		this.callback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			if ((f !== undefined) && !isConsoleLog(f) && f.name !== "require") {
				dis.functionIdHandler.setFunctionId(f);

				if (!f.temporaryTraceId) {
					f.temporaryTraceId = dis.functionsExecutionStack.getTraceId();
				}

				for (var argIndex in args) {
					addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
					addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);

					if (f.isInstrumented === true) {
						convertToWrapperObject(args, argIndex);
					} else {
						convertToOriginalObject(args, argIndex);
					}
				}

				if (functionNotProcessed(f)) {
					var functionContainer = new FunctionContainer(f, isConstructor);
					functionContainer.functionIid = functionIid;

					dis.runTimeInfo[functionContainer.functionId] = functionContainer;
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
				let currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();
				let shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

				let containerForAddingNewInteraction = dis.interactionContainerFinder.findInteraction(shadowId);
				if (currentActiveFiid && containerForAddingNewInteraction) {
					let usedAsArgumentInteraction = new UsedAsArgumentInteraction(
						currentActiveFiid,
						functionId,
						argIndex,
						f.temporaryTraceId
					);

					let traceId = dis.objectTraceIdMap.get(val);
					if (traceId) {
						usedAsArgumentInteraction.traceId = traceId;
					}

					containerForAddingNewInteraction.addInteraction(usedAsArgumentInteraction);
				}
			}
		}

		function convertToWrapperObject(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.convertToWrapperObject(args[argIndex]);
		}

		function convertToOriginalObject(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(args[argIndex]);
		}
	}

	sandbox.analysis = new InvokeFunPreAnalysis();

}(J$));