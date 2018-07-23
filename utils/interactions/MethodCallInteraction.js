/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function MethodCallInteraction(iid, methodName) {
		Interaction.call(this);

		this.code = 'methodCall';
		
		this.iid = iid;
		this.methodName = methodName;
		
		this.isComputed = null;
		this.isOpAssign = null;
		this.isMethodCall = true;
		this.functionIid = null;
		this.enclosingFunctionId = null;
	}

	MethodCallInteraction.prototype = Object.create(Interaction.prototype);
	MethodCallInteraction.prototype.constructor = MethodCallInteraction;

	exp.MethodCallInteraction = MethodCallInteraction;

})(module.exports);