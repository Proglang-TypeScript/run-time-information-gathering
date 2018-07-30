/* global module */
/* global require */

"use strict";

(function(exp) {
	function AnalysisBuilder(sandbox, runTimeInfo) {
		this.sandbox = sandbox;
		this.runTimeInfo = runTimeInfo;

		this.buildCallbacks = function() {
			var functionsExecutionStack = new (require("../utils/functionsExecutionStack.js")).FunctionsExecutionStack();
			var sMemoryInterface = new (require("../utils/sMemoryInterface.js")).SMemoryInterface(sandbox.smemory);
			var mapWrapperObjectsOriginalValues = {};

			var objectSerializer = new (require("../utils/objectSerializer.js")).ObjectSerializer(
				sMemoryInterface
			);

			var interactionSerializer = new (require("../utils/interactionSerializer.js")).InteractionSerializer(
				objectSerializer
			);

			var argumentContainerFinder = new (require("../utils/argumentContainerFinder.js")).ArgumentContainerFinder(
				runTimeInfo,
				sMemoryInterface
			);

			var interactionFinder = new (require("../utils/interactionFinder.js")).InteractionFinder(
				runTimeInfo,
				sMemoryInterface
			);

			var recursiveInteractionsHandler = new (require("../utils/recursiveInteractionsHandler.js")).RecursiveInteractionsHandler(
				sMemoryInterface,
				interactionSerializer
			);

			var argumentProxyBuilder = new (require("../utils/argumentProxyBuilder.js")).ArgumentProxyBuilder(
				sMemoryInterface
			);

			var argumentWrapperObjectBuilder = new (require("../utils/argumentWrapperObjectBuilder.js")).ArgumentWrapperObjectBuilder();

			var functionIdHandler = new (require("../utils/functionIdHandler.js")).FunctionIdHandler();

			var interactionWithResultHandler = new (require("../utils/interactionWithResultHandler.js")).InteractionWithResultHandler(
				interactionFinder,
				recursiveInteractionsHandler,
				sMemoryInterface,
				argumentContainerFinder
			);

			return {
				functionEnter: new (require("./callbacks/functionEnter.js")).FunctionEnter(
					runTimeInfo,
					functionsExecutionStack,
					functionIdHandler
				),
				functionExit: new (require("./callbacks/functionExit.js")).FunctionExit(
					functionsExecutionStack
				),
				declare: new (require("./callbacks/declare.js")).Declare(
					runTimeInfo,
					functionsExecutionStack,
					argumentContainerFinder,
					sMemoryInterface
				),
				invokeFunPre: new (require("./callbacks/invokeFunPre.js")).InvokeFunPre(
					runTimeInfo,
					functionsExecutionStack,
					sMemoryInterface,
					argumentContainerFinder,
					argumentProxyBuilder,
					argumentWrapperObjectBuilder,
					functionIdHandler,
					mapWrapperObjectsOriginalValues
				),
				invokeFun: new (require("./callbacks/invokeFun.js")).InvokeFun(
					runTimeInfo,
					functionsExecutionStack,
					argumentWrapperObjectBuilder,
					interactionWithResultHandler
				),
				getFieldPre: new (require("./callbacks/getFieldPre.js")).GetFieldPre(
					functionsExecutionStack,
					sMemoryInterface,
					argumentContainerFinder,
					interactionFinder,
					recursiveInteractionsHandler,
					functionIdHandler
				),
				putFieldPre: new (require("./callbacks/putFieldPre.js")).PutFieldPre(
					functionsExecutionStack,
					sMemoryInterface,
					argumentContainerFinder,
					interactionFinder
				),
				write: new (require("./callbacks/write.js")).Write(
					functionsExecutionStack,
					sMemoryInterface
				),
				binaryPre: new (require("./callbacks/binaryPre.js")).BinaryPre(
					mapWrapperObjectsOriginalValues,
					sMemoryInterface
				),
				unaryPre: new (require("./callbacks/unaryPre.js")).UnaryPre(
					mapWrapperObjectsOriginalValues,
					sMemoryInterface
				)
			};
		};
	}

	exp.AnalysisBuilder = AnalysisBuilder;

})(module.exports);