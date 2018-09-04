/* global module */
/* global require */

"use strict";

(function(exp) {
	function AnalysisBuilder(sandbox) {
		this.sandbox = sandbox;
		this.runTimeInfo = sandbox.runTimeInfo;

		this.buildCallbacks = function() {
			var variables = buildVariables(sandbox);

			return {
				functionEnter: new (require("./callbacks/functionEnter.js")).FunctionEnter(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.functionIdHandler,
					sandbox
				),
				functionExit: new (require("./callbacks/functionExit.js")).FunctionExit(
					variables.functionsExecutionStack
				),
				declare: new (require("./callbacks/declare.js")).Declare(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.argumentContainerFinder,
					variables.sMemoryInterface,
					sandbox
				),
				invokeFunPre: new (require("./callbacks/invokeFunPre.js")).InvokeFunPre(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.argumentContainerFinder,
					variables.functionIdHandler,
					variables.wrapperObjectsHandler,
					sandbox
				),
				invokeFun: new (require("./callbacks/invokeFun.js")).InvokeFun(
					this.runTimeInfo,
					variables.functionsExecutionStack,
					variables.argumentWrapperObjectBuilder,
					variables.interactionWithResultHandler,
					sandbox
				),
				getFieldPre: new (require("./callbacks/getFieldPre.js")).GetFieldPre(
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.functionIdHandler,
					variables.interactionWithResultHandler,
					sandbox
				),
				putFieldPre: new (require("./callbacks/putFieldPre.js")).PutFieldPre(
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					variables.argumentContainerFinder,
					variables.interactionFinder,
					sandbox
				),
				write: new (require("./callbacks/write.js")).Write(
					variables.functionsExecutionStack,
					variables.sMemoryInterface,
					sandbox
				),
				binaryPre: new (require("./callbacks/binaryPre.js")).BinaryPre(
					variables.wrapperObjectsHandler
				),
				unaryPre: new (require("./callbacks/unaryPre.js")).UnaryPre(
					variables.wrapperObjectsHandler
				)
			};
		};

		function buildVariables(sandbox) {
			var variables = {};

			variables.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
			variables.sMemoryInterface = sandbox.utils.sMemoryInterface;
			variables.objectSerializer = sandbox.utils.objectSerializer;
			variables.interactionSerializer = sandbox.utils.interactionSerializer;
			variables.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
			variables.interactionFinder = sandbox.utils.interactionFinder;
			variables.recursiveInteractionsHandler = sandbox.utils.recursiveInteractionsHandler;
			variables.argumentProxyBuilder = sandbox.utils.argumentProxyBuilder;
			variables.argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;
			variables.functionIdHandler = sandbox.utils.functionIdHandler;
			variables.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;
			variables.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

			return variables;
		}
	}

	exp.AnalysisBuilder = AnalysisBuilder;

})(module.exports);