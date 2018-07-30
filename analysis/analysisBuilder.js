/* global module */
/* global require */

"use strict";

(function(exp) {
	function AnalysisBuilder(sandbox, runTimeInfo) {
		this.sandbox = sandbox;
		this.runTimeInfo = runTimeInfo;

		var dis = this;

		this.buildCallbacks = function() {
			var variables = buildVariables();

			return {
				functionEnter: new (require("./callbacks/functionEnter.js")).FunctionEnter(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.functionIdHandler
				),
				functionExit: new (require("./callbacks/functionExit.js")).FunctionExit(
					variables.functionsExecutionStack
				),
				declare: new (require("./callbacks/declare.js")).Declare(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.argumentContainerFinder,
					variables.sMemoryInterface
				),
				invokeFunPre: new (require("./callbacks/invokeFunPre.js")).InvokeFunPre(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.argumentContainerFinder,
					variables.functionIdHandler,
					variables.wrapperObjectsHandler
				),
				invokeFun: new (require("./callbacks/invokeFun.js")).InvokeFun(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.argumentWrapperObjectBuilder,
					variables.interactionWithResultHandler
				),
				getFieldPre: new (require("./callbacks/getFieldPre.js")).GetFieldPre(
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.functionIdHandler,
					variables.interactionWithResultHandler
				),
				putFieldPre: new (require("./callbacks/putFieldPre.js")).PutFieldPre(
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.argumentContainerFinder,
					variables.interactionFinder
				),
				write: new (require("./callbacks/write.js")).Write(
					variables.functionsExecutionStack,
					variables.sMemoryInterface
				),
				binaryPre: new (require("./callbacks/binaryPre.js")).BinaryPre(
					variables.wrapperObjectsHandler
				),
				unaryPre: new (require("./callbacks/unaryPre.js")).UnaryPre(
					variables.wrapperObjectsHandler
				)
			};
		};

		function buildVariables() {
			var variables = {};

			variables.functionsExecutionStack = new (require("../utils/functionsExecutionStack.js")).FunctionsExecutionStack();
			variables.sMemoryInterface = new (require("../utils/sMemoryInterface.js")).SMemoryInterface(sandbox.smemory);

			variables.objectSerializer = new (require("../utils/objectSerializer.js")).ObjectSerializer(
				variables.sMemoryInterface
			);

			variables.interactionSerializer = new (require("../utils/interactionSerializer.js")).InteractionSerializer(
				variables.objectSerializer
			);

			variables.argumentContainerFinder = new (require("../utils/argumentContainerFinder.js")).ArgumentContainerFinder(
				dis.runTimeInfo,
				variables.sMemoryInterface
			);

			variables.interactionFinder = new (require("../utils/interactionFinder.js")).InteractionFinder(
				dis.runTimeInfo,
				variables.sMemoryInterface
			);

			variables.recursiveInteractionsHandler = new (require("../utils/recursiveInteractionsHandler.js")).RecursiveInteractionsHandler(
				variables.sMemoryInterface,
				variables.interactionSerializer
			);

			variables.argumentProxyBuilder = new (require("../utils/argumentProxyBuilder.js")).ArgumentProxyBuilder(
				variables.sMemoryInterface
			);

			variables.argumentWrapperObjectBuilder = new (require("../utils/argumentWrapperObjectBuilder.js")).ArgumentWrapperObjectBuilder();

			variables.functionIdHandler = new (require("../utils/functionIdHandler.js")).FunctionIdHandler();

			variables.interactionWithResultHandler = new (require("../utils/interactionWithResultHandler.js")).InteractionWithResultHandler(
				variables.interactionFinder,
				variables.recursiveInteractionsHandler,
				variables.sMemoryInterface,
				variables.argumentContainerFinder
			);

			variables.wrapperObjectsHandler = new (require("../utils/wrapperObjectsHandler.js")).WrapperObjectsHandler(
				variables.sMemoryInterface,
				variables.argumentWrapperObjectBuilder,
				variables.argumentProxyBuilder
			);

			return variables;
		}
	}

	exp.AnalysisBuilder = AnalysisBuilder;

})(module.exports);