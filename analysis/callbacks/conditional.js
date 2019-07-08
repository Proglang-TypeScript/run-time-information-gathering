/* global J$ */

"use strict";

(function (sandbox) {
	function ConditionalAnalysis() {
		this.callbackName = "conditional";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
		this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

		this.operatorInteractionBuilder = sandbox.utils.operatorInteractionBuilder;

		var dis = this;

		this.callback = function(
			iid,
			result
		) {

			let newResult = result;

			if (dis.wrapperObjectsHandler.objectIsWrapperObject(result)) {
				let finalRealValueFromWrapperObject = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result);

				if ((finalRealValueFromWrapperObject === undefined) || (finalRealValueFromWrapperObject === null)) {
					newResult = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result);
				}
			}

			let leftOperatorInteraction = dis.operatorInteractionBuilder.build(
				"conditional",
				dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result),
				undefined
			);

			if (addInteractionIfNecessary(leftOperatorInteraction, result) === true) {
				leftOperatorInteraction.operandForInteraction = "left";
			}

			return {
				result: newResult
			};
		};

		function addInteractionIfNecessary(interaction, operand) {
			let interactionContainer = dis.interactionContainerFinder.findInteraction(
				dis.sMemoryInterface.getShadowIdOfObject(operand)
			);

			if (interactionContainer) {
				let traceId = dis.objectTraceIdMap.get(operand);
				if (traceId) {
					interaction.traceId = traceId;
				}

				interactionContainer.addInteraction(interaction);

				return true;
			} else {
				return false;
			}
		}
	}

	sandbox.analysis = new ConditionalAnalysis();

}(J$));