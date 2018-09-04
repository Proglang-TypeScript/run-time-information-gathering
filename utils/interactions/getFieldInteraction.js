/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function GetFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'getField';
		
		this.returnTypeOf = null;
	}

	GetFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	GetFieldInteraction.prototype.constructor = GetFieldInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.GetFieldInteraction = GetFieldInteraction;
}(J$));