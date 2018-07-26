/* global module */
/* global require */

"use strict";

(function(exp) {
	var getRandomIdentifier = require("../../utils/getRandomIdentifier.js").getRandomIdentifier;
	var FunctionContainer = require("../../utils/functionContainer.js").FunctionContainer;
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getDeclarationEnclosingFunctionId = require("../../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

	var UsedAsArgumentInteraction = require("../../utils/interactions/usedAsArgumentInteraction.js").UsedAsArgumentInteraction;
	var ArgumentProxyBuilder = require("../../utils/argumentProxyBuilder.js").ArgumentProxyBuilder;

	function InvokeFunPre(
		runTimeInfo,
		functionsExecutionStack,
		mapMethodIdentifierInteractions,
		mapProxyShadowIds,
		sMemoryInterface,
		argumentContainerFinder
	) {

		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.mapProxyShadowIds = mapProxyShadowIds;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

		this.argumentProxyBuilder = new ArgumentProxyBuilder();

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			addFunctionIidToMethodCallInteraction(f, functionIid);

			for (var argIndex in args) {
				addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
				addUsedAsArgumentInteractionIfApplicable(args[argIndex], functionIid, argIndex);
				convertToProxyIfItIsAnObject(args, argIndex);
			}

			if (functionIid && !(functionIid in this.runTimeInfo)) {
				var functionContainer = new FunctionContainer(
					functionIid,
					getFunctionName(f)
				);

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

		function getFunctionName(f) {
			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			return functionName;
		}

		function addFunctionIidToMethodCallInteraction(f, functionIid) {
			if (f.methodIdentifier in dis.mapMethodIdentifierInteractions) {
				var interaction = dis.mapMethodIdentifierInteractions[f.methodIdentifier];
				interaction.functionIid = functionIid;
			}
		}

		function addDeclarationEnclosingFunctionIdIfApplicable(val) {
			if (getTypeOf(val) == "function") {
				if (!val.declarationEnclosingFunctionId) {
					val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
				}
			}
		}

		function addUsedAsArgumentInteractionIfApplicable(val, functionIid, argIndex) {
			if (getTypeOf(val) == "object") {
				var currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();
				var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

				var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, currentActiveFiid);
				if (currentActiveFiid && argumentContainer) {
					var usedAsArgumentInteraction = new UsedAsArgumentInteraction(
						currentActiveFiid,
						functionIid,
						argIndex
					);

					argumentContainer.addInteraction(usedAsArgumentInteraction);
				}
			}
		}

		function convertToProxyIfItIsAnObject(args, argIndex) {
			if (getTypeOf(args[argIndex]) == "object") {

				let obj = args[argIndex];
				let proxy = dis.argumentProxyBuilder.buildProxy(obj);
				args[argIndex] = proxy;

				var shadowIdProxy = dis.sMemoryInterface.getShadowIdOfObject(proxy);
				dis.mapProxyShadowIds[shadowIdProxy] = obj;
			}
		}
	}

	exp.InvokeFunPre = InvokeFunPre;

})(module.exports);