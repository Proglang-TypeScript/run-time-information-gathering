/* global J$ */

"use strict";

(function (sandbox) {
	function BinaryPreAnalysis() {
		this.callbackName = "binaryPre";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
		this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;
		this.operatorsTypeCoercionAnalyzer = sandbox.utils.operatorsTypeCoercionAnalyzer;

		var dis = this;

		this.callback = function(
			iid,
			op,
			left,
			right
		) {

			let originalLeft = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(left);
			let originalRight = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(right)

			let typeCoercion = dis.operatorsTypeCoercionAnalyzer.analyzeTypeCoercion(
				op,
				originalLeft,
				originalRight
			);

			if (typeCoercion !== null) {
				addInteractionIfNecessary(typeCoercion.left, left);
				addInteractionIfNecessary(typeCoercion.right, right);
			}

			let equalityOperations = [
				"==",
				"!=",
				"===",
				"!=="
			];

			if (equalityOperations.indexOf(op) !== -1) {
				left = originalLeft;
				right = originalRight;
			}

			return {
				op: op,
				left: left,
				right: right,
				skip: false
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
			}
		}
	}

	sandbox.analysis = new BinaryPreAnalysis();

}(J$));