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
		this.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
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

			if ((f !== undefined) && !isConsoleLog(f)) {
				dis.functionIdHandler.setFunctionId(f);

				if (!f.temporaryTraceId) {
					f.temporaryTraceId = dis.functionsExecutionStack.getTraceId();
				}

				for (var argIndex in args) {
					addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
					addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);
					convertToWrapperObjectIfItIsALiteral(args, argIndex);
					convertToProxyIfItIsAnObject(args, argIndex);
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
				var currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();
				var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

				var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, currentActiveFiid);
				if (currentActiveFiid && argumentContainer) {
					var usedAsArgumentInteraction = new UsedAsArgumentInteraction(
						currentActiveFiid,
						functionId,
						argIndex,
						f.temporaryTraceId
					);

					let traceId = dis.objectTraceIdMap.get(val);
					if (traceId) {
						usedAsArgumentInteraction.traceId = traceId;
					}

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

	sandbox.analysis = new InvokeFunPreAnalysis();

}(J$));