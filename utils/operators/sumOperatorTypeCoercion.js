/* global J$ */

"use strict";

(function (sandbox) {
	function SumOperatorTypeCoercion() {
		this.toPrimitive = sandbox.utils.toPrimitive;
		this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;

		this.operators = ["+"];

		this.getTypeCoercion = function(left, right) {
			let ConvertedToInteraction = sandbox.utils.ConvertedToInteraction;
		
			let leftPrimitive = this.toPrimitive(left);
			let rightPrimitive = this.toPrimitive(right);
		
			let leftConvertedTo = new ConvertedToInteraction();
			let rightConvertedTo = new ConvertedToInteraction();
		
			if (leftPrimitive !== left) {
				leftConvertedTo.addToPrimitive("default", sandbox.functions.getTypeOf(leftPrimitive));
				left = leftPrimitive;
			}
		
			if (rightPrimitive !== right) {
				rightConvertedTo.addToPrimitive("default", sandbox.functions.getTypeOf(rightPrimitive));
				right = rightPrimitive;
			}
		
			let typeOfLeft = sandbox.functions.getTypeOf(left);
			let typeOfRight = sandbox.functions.getTypeOf(right);
		
			if (typeOfLeft === "string" || typeOfRight === "string") {
				leftConvertedTo.convertedTo = "string";
				rightConvertedTo.convertedTo = "string";
			} else {
				leftConvertedTo.convertedTo = "number";
				leftConvertedTo.isNaN = isNaN(left);

				rightConvertedTo.convertedTo = "number";
				rightConvertedTo.isNaN = isNaN(right);
			}

			return {
				left: leftConvertedTo,
				right: rightConvertedTo
			};
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.sumOperatorTypeCoercion = new SumOperatorTypeCoercion();
}(J$));