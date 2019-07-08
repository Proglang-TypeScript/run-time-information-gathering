/* global J$ */

"use strict";

(function (sandbox) {
	var OperatorInteraction = sandbox.utils.OperatorInteraction;
	var toPrimitive = sandbox.utils.toPrimitive;
	var getTypeOf = sandbox.functions.getTypeOf;

	function OperatorInteractionBuilder() {
		this.build = function(operator, left, right) {
			let operatorInteraction = new OperatorInteraction();
			operatorInteraction.leftType = getTypeOf(left);
			operatorInteraction.rightType = getTypeOf(right);
			operatorInteraction.leftIsNaN = isNaN(left);
			operatorInteraction.rightIsNan = isNaN(right)

			let leftToPrimitive = toPrimitive(left);
			let rightToPrimitive = toPrimitive(right);
			operatorInteraction.leftToPrimitiveType = getTypeOf(leftToPrimitive);
			operatorInteraction.rightToPrimitiveType = getTypeOf(rightToPrimitive);
			operatorInteraction.operator = operator;
			operatorInteraction.leftToPrimitiveIsNaN = isNaN(leftToPrimitive);
			operatorInteraction.rightToPrimitiveIsNaN = isNaN(rightToPrimitive);

			return operatorInteraction;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.operatorInteractionBuilder = new OperatorInteractionBuilder();
}(J$));