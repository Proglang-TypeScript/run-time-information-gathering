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
		mapMethodIdentifierInteractions,
		sMemoryInterface,
		argumentContainerFinder,
		argumentProxyBuilder,
		argumentWrapperObjectBuilder,
		functionIdHandler,
		mapWrapperObjectsOriginalValues
	) {

		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;
		this.argumentProxyBuilder = argumentProxyBuilder;
		this.functionIdHandler = functionIdHandler;

		this.mapWrapperObjectsOriginalValues = mapWrapperObjectsOriginalValues;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			if (!isConsoleLog(f)) {
				let functionId = this.functionIdHandler.setFunctionId(f);

				addFunctionIdToMethodCallInteraction(f);

				for (var argIndex in args) {
					addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
					addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);
					convertToWrapperObjectIfItIsALiteral(args, argIndex);
					convertToProxyIfItIsAnObject(args, argIndex);
				}

				if (functionNotProcessed(f)) {
					var functionContainer = new FunctionContainer(
						functionId,
						getFunctionName(f)
					);

					functionContainer.iid = iid;
					functionContainer.isConstructor = isConstructor;
					functionContainer.isMethod = isMethod;
					functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;
					functionContainer.functionIid = functionIid;

					this.runTimeInfo[functionContainer.functionId] = functionContainer;
				}
			}

			return {
				f: f,
				base: base,
				args: args,
				skip: false
			};
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}

		function setFunctionId(f, functionIid) {
			let functionIdField = "functionId";

			if (functionIid) {
				f[functionIdField] = functionIid;
			} else {
				if (f.methodIdentifier) {
					f[functionIdField] = f.methodIdentifier;
				}
			}
		}

		function isConsoleLog(f) {
			return (f.name === "bound consoleCall");
		}

		function getFunctionName(f) {
			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			return functionName;
		}

		function addFunctionIdToMethodCallInteraction(f) {
			if (f.methodIdentifier in dis.mapMethodIdentifierInteractions) {
				var interaction = dis.mapMethodIdentifierInteractions[f.methodIdentifier];
				interaction.functionId = dis.functionIdHandler.getFunctionId(f);
			}
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
			let originalArg = args[argIndex];
			let newArg;

			switch(getTypeOf(args[argIndex])) {
				case "string":
					newArg = dis.argumentWrapperObjectBuilder.buildFromString(originalArg);
					break;

				case "number":
					newArg = dis.argumentWrapperObjectBuilder.buildFromNumber(originalArg);
					break;
			}

			if (newArg) {
				args[argIndex] = newArg;

				let shadowIdProxy = dis.sMemoryInterface.getShadowIdOfObject(newArg);
				dis.mapWrapperObjectsOriginalValues[shadowIdProxy] = originalArg;
			}
		}

		function convertToProxyIfItIsAnObject(args, argIndex) {
			let arg = args[argIndex];

			if (getTypeOf(arg) == "object" && !(arg instanceof String) && !(arg instanceof Number)) {

				let proxy = dis.argumentProxyBuilder.buildProxy(arg);
				args[argIndex] = proxy;

				var shadowIdProxy = dis.sMemoryInterface.getShadowIdOfObject(proxy);
				dis.mapWrapperObjectsOriginalValues[shadowIdProxy] = arg;
			}
		}
	}

	exp.InvokeFunPre = InvokeFunPre;

})(module.exports);