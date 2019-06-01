/* global J$ */

"use strict";

(function (sandbox) {
	function GetFieldPreAnalysis() {
		this.callbackName = "getField";

		var MethodCallInteraction = sandbox.utils.MethodCallInteraction;
		var GetFieldInteraction = sandbox.utils.GetFieldInteraction;

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.functionIdHandler = sandbox.utils.functionIdHandler;
		this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;
		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function(
            iid,
            base,
			offset,
			val,
            isComputed,
            isOpAssign,
            isMethodCall
		) {

			let result = val;

			if (isMethodCall === true) {
				processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid);
			} else {
				if (dis.wrapperObjectsHandler.objectIsWrapperObject(result) !== true) {
					result = dis.wrapperObjectsHandler.convertToWrapperObject(result);
				}

				processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid, result);
			}

			return {
				result: result
			};
		};

		function processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid, result) {
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
				result,
				base
			);
		}

		function getGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new GetFieldInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;

			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

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

			let traceId = dis.objectTraceIdMap.get(base);
			if (traceId) {
				interaction.traceId = traceId;
			}

			base[offset].temporaryTraceId = dis.functionsExecutionStack.getTraceId();
			interaction.traceIdInTargetFunction = base[offset].temporaryTraceId;

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