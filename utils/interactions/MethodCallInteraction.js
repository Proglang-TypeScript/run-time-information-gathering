/* global module */
/* global require */

"use strict";

(function(exp) {
	var ActiveInteraction = require("./activeInteraction.js").ActiveInteraction;

	function MethodCallInteraction(iid, methodName) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.methodName = methodName;

		this.code = 'methodCall';
		
		this.functionId = null;
		this.returnTypeOf = null;
	}

	MethodCallInteraction.prototype = Object.create(ActiveInteraction.prototype);
	MethodCallInteraction.prototype.constructor = MethodCallInteraction;

	exp.MethodCallInteraction = MethodCallInteraction;

})(module.exports);