/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function OperatorInteraction() {
		Interaction.call(this);

		this.code = "operator";

		this.leftType = "";
		this.rightType = "";
		this.leftIsNaN = false;
		this.rightIsNan = false;
		this.leftToPrimitiveType = null;
		this.rightToPrimitiveType = null;
		this.leftToPrimitiveIsNaN = false;
		this.rightToPrimitiveIsNaN = false;
		this.operator = "";
		this.operandForInteraction = "";
	}

	OperatorInteraction.prototype = Object.create(Interaction.prototype);
	OperatorInteraction.prototype.constructor = OperatorInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.OperatorInteraction = OperatorInteraction;
}(J$));