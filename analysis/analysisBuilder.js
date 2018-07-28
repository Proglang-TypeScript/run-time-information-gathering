/* global module */
/* global require */

"use strict";

(function(exp) {
	function AnalysisBuilder(sandbox, runTimeInfo) {
		this.sandbox = sandbox;
		this.runTimeInfo = runTimeInfo;

		this.buildCallbacks = function() {
			var functionsExecutionStack = new (require("../utils/functionsExecutionStack.js")).FunctionsExecutionStack();
			var mapShadowIdsArgumentContainer = {};
			var mapMethodIdentifierInteractions = {};
			var sMemoryInterface = new (require("../utils/sMemoryInterface.js")).SMemoryInterface(sandbox.smemory);
			var mapShadowIdsInteractions = {};
			var mapProxyObjectsOriginalObjects = {};
			var mapWrapperObjectsOriginalValues = {};

			var objectSerializer = new (require("../utils/objectSerializer.js")).ObjectSerializer(
				sMemoryInterface
			);

			var interactionSerializer = new (require("../utils/interactionSerializer.js")).InteractionSerializer(
				objectSerializer
			);

			var argumentContainerFinder = new (require("../utils/argumentContainerFinder.js")).ArgumentContainerFinder(
				runTimeInfo,
				mapShadowIdsArgumentContainer
			);

			var interactionFinder = new (require("../utils/interactionFinder.js")).InteractionFinder(
				runTimeInfo,
				mapShadowIdsInteractions
			);

			var recursiveInteractionsHandler = new (require("../utils/recursiveInteractionsHandler.js")).RecursiveInteractionsHandler(
				sMemoryInterface,
				interactionSerializer
			);

			var argumentProxyBuilder = new (require("../utils/argumentProxyBuilder.js")).ArgumentProxyBuilder(
				sMemoryInterface
			);

			return {
				functionEnter: new (require("./callbacks/functionEnter.js")).FunctionEnter(
					runTimeInfo,
					functionsExecutionStack
				),
				functionExit: new (require("./callbacks/functionExit.js")).FunctionExit(
					functionsExecutionStack
				),
				declare: new (require("./callbacks/declare.js")).Declare(
					runTimeInfo,
					functionsExecutionStack,
					mapShadowIdsArgumentContainer,
					sMemoryInterface
				),
				invokeFunPre: new (require("./callbacks/invokeFunPre.js")).InvokeFunPre(
					runTimeInfo,
					functionsExecutionStack,
					mapMethodIdentifierInteractions,
					sMemoryInterface,
					argumentContainerFinder,
					argumentProxyBuilder,
					mapProxyObjectsOriginalObjects,
					mapWrapperObjectsOriginalValues
				),
				invokeFun: new (require("./callbacks/invokeFun.js")).InvokeFun(
					runTimeInfo,
					sMemoryInterface,
					recursiveInteractionsHandler,
					interactionFinder,
					functionsExecutionStack,
					mapMethodIdentifierInteractions,
					mapShadowIdsInteractions
				),
				getFieldPre: new (require("./callbacks/getFieldPre.js")).GetFieldPre(
					functionsExecutionStack,
					mapMethodIdentifierInteractions,
					sMemoryInterface,
					argumentContainerFinder,
					interactionFinder,
					recursiveInteractionsHandler,
					mapShadowIdsInteractions
				),
				putFieldPre: new (require("./callbacks/putFieldPre.js")).PutFieldPre(
					functionsExecutionStack,
					sMemoryInterface,
					argumentContainerFinder,
					interactionFinder,
					mapShadowIdsInteractions
				),
				write: new (require("./callbacks/write.js")).Write(
					functionsExecutionStack,
					sMemoryInterface
				),
				binaryPre: new (require("./callbacks/binaryPre.js")).BinaryPre(
					mapProxyObjectsOriginalObjects,
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