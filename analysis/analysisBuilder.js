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