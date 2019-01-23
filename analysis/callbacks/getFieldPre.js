/* global J$ */

"use strict";

(function (sandbox) {
	function GetFieldPreAnalysis() {
		this.callbackName = "getFieldPre";

		var MethodCallInteraction = sandbox.utils.MethodCallInteraction;
		var GetFieldInteraction = sandbox.utils.GetFieldInteraction;

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.functionIdHandler = sandbox.utils.functionIdHandler;
		this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

		var dis = this;

		this.callback = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
		) {
			if (isMethodCall === true) {
				processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid);
			} else {
				processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid);
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};

		function processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var getFieldInteraction = getGetFieldInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			dis.interactionWithResultHandler.processInteractionWithResult(
				getFieldInteraction,
				dis.functionsExecutionStack.getCurrentExecutingFunction(),
				base[offset],
				base
			);
		}

		function getGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new GetFieldInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;

			let execution = dis.functionsExecutionStack.getCurrentExecution();
			interaction.enclosingFunctionId = execution.fid;

			let traceId = dis.objectTraceIdMap.get(base);
			if (traceId) {
				interaction.traceId = traceId;
			}

			interaction.setReturnTypeOf(base[offset]);

			return interaction;
		}

		function processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			if (base[offset] !== undefined) {
				base[offset].methodName = offset;

				var methodCallInteraction = getMethodCallInteraction(
					base,
					offset,
					isComputed,
					isOpAssign,
					iid
				);

				addFunctionIdToInteraction(methodCallInteraction, base[offset]);
			}
		}

		function getMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new MethodCallInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;

			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}

		function addFunctionIdToInteraction(interaction, f) {
			let functionId = dis.functionIdHandler.setFunctionId(f);

			interaction.functionId = functionId;
			f.lastInteraction = interaction;
		}
	}

	sandbox.analysis = new GetFieldPreAnalysis();

}(J$));