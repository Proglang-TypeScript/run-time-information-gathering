/* global module */
/* global require */

"use strict";

(function(exp) {
	var ActiveInteraction = require("./activeInteraction.js").ActiveInteraction;

	function GetFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'getField';
		this.isMethodCall = false;
		
		this.returnTypeOf = null;
	}

	GetFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	GetFieldInteraction.prototype.constructor = GetFieldInteraction;

	exp.GetFieldInteraction = GetFieldInteraction;

})(module.exports);