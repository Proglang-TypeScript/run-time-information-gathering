/* global module */

"use strict";

(function(exp) {
	function MethodCallInteraction(iid, methodName) {
		this.code = 'methodCall';
		
		this.iid = iid;
		this.methodName = methodName;
		
		this.isComputed = null;
		this.isOpAssign = null;
		this.isMethodCall = true;
		this.functionIid = null;
		this.enclosingFunctionId = null;
	}

	exp.MethodCallInteraction = MethodCallInteraction;

})(module.exports);