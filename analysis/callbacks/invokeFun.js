/* global module */

"use strict";

(function(exp) {

	function InvokeFun(
		runTimeInfo,
		functionsExecutionStack,
		argumentWrapperObjectBuilder,
		interactionWithResultHandler,
		sandbox
	) {
		
		var getTypeOf = sandbox.functions.getTypeOf;
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.functionsExecutionStack = functionsExecutionStack;
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;
		this.interactionWithResultHandler = interactionWithResultHandler;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			result
		) {

			var functionContainer = getFunctionContainer(f);

			if (functionContainer) {
				functionContainer.addReturnTypeOf(result);

				if (f.lastInteraction) {
					var interaction = f.lastInteraction;
					interaction.setReturnTypeOf(result);

					result = changeResultToWrapperObjectIfItIsALiteral(result);

					this.interactionWithResultHandler.processInteractionWithResult(
						interaction,
						this.functionsExecutionStack.getCurrentExecutingFunction(),
						// Let variable 'f' be the function that executed the invokeFun() callback.
						// invokeFun() callback is executed after functionExit(),
						// so the current executing function is the function that executed function 'f'.

						result,
						base
					);
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

	exp.InvokeFun = InvokeFun;

})(module.exports);