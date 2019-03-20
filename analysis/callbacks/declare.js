/* global J$ */

"use strict";

(function (sandbox) {
	function DeclareAnalysis() {
		this.callbackName = "declare";

		var ArgumentContainer = sandbox.utils.ArgumentContainer;
		var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;
		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

		var InputValueInteraction = sandbox.utils.InputValueInteraction;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

		var dis = this;

		this.callback = function(iid, name, val, isArgument, argumentIndex) {
			if (isAnArgumentOfAProcessedFunction(argumentIndex, isArgument)) {
				var functionContainer = getFunctionContainer();

				if (functionContainer) {
					var argumentContainer = buildArgumentContainer(argumentIndex, name, val);
					functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

					dis.interactionContainerFinder.addMapping(argumentContainer, val);
				}
			}

			if (typeof val == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
				val.isInstrumented = true;
			}

			return {
				result: val
			};

		};

		function isAnArgumentOfAProcessedFunction(argumentIndex, isArgument) {
			return (
				argumentIndex >= 0 &&
				isArgument === true &&
				dis.functionsExecutionStack.isThereAFunctionExecuting()
			);
		}

		function getFunctionContainer() {
			let functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			return dis.runTimeInfo[functionId];
		}

		function buildArgumentContainer(argumentIndex, name, val) {
			var argumentContainer = new ArgumentContainer(argumentIndex, name);

			let interaction = new InputValueInteraction(getTypeOfForReporting(val));

			let execution = dis.functionsExecutionStack.getCurrentExecution();
			interaction.traceId = execution.traceId;

			argumentContainer.addInteraction(interaction);

			dis.objectTraceIdMap.set(val, execution.traceId);

			return argumentContainer;
		}
	}

	sandbox.analysis = new DeclareAnalysis();

}(J$));