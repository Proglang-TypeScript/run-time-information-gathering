/* global module */
/* global require */

"use strict";

(function(exp) {
	var Interaction = require("./interaction.js").Interaction;

	function GetFieldInteraction(iid, field) {
		Interaction.call(this);

		this.code = 'getField';
		
		this.iid = iid;
		this.field = field;
		
		this.isComputed = null;
		this.isOpAssign = null;
		this.isMethodCall = false;

		this.enclosingFunctionId = null;
		this.returnTypeOf = null;
	}

	GetFieldInteraction.prototype = Object.create(Interaction.prototype);
	GetFieldInteraction.prototype.constructor = GetFieldInteraction;

	exp.GetFieldInteraction = GetFieldInteraction;

})(module.exports);