/* global J$ */

"use strict";

(function (sandbox) {
	function InvokeFunAnalysis() {
		this.callbackName = "invokeFun";

		var getTypeOf = sandbox.functions.getTypeOf;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;
		this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;

		var dis = this;

		this.callback = function(
			iid,
			f,
			base,
			args,
			result
		) {

			if (f !== undefined) {
				var functionContainer = getFunctionContainer(f);

				if (functionContainer) {
					if (f.lastInteraction) {
						var interaction = f.lastInteraction;
						interaction.setReturnTypeOf(result);

						result = changeResultToWrapperObjectIfItIsALiteral(result);

						dis.interactionWithResultHandler.processInteractionWithResult(
							interaction,
							dis.functionsExecutionStack.getCurrentExecutingFunction(),
							// Let variable 'f' be the function that executed the invokeFun() callback.
							// invokeFun() callback is executed after functionExit(),
							// so the current executing function is the function that executed function 'f'.
							result,
							base
						);
					}

					let lastStopped = dis.functionsExecutionStack.getLastStopped();
					functionContainer.addReturnTypeOf(result, lastStopped ? lastStopped.traceId : null);
				}

			}

			return {
				result: result
			};
		};

		function changeResultToWrapperObjectIfItIsALiteral(result) {
			switch(getTypeOf(result)) {
				case "string":
					return dis.argumentWrapperObjectBuilder.buildFromString(result);

				case "number":
					return dis.argumentWrapperObjectBuilder.buildFromNumber(result);

				default:
					return result;
			}
		}

		function getFunctionContainer(f) {
			return dis.runTimeInfo[f.functionId];
		}
	}

	sandbox.analysis = new InvokeFunAnalysis();

}(J$));