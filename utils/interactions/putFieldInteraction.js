/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function PutFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'setField';

		this.typeof = null;
	}

	PutFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	PutFieldInteraction.prototype.constructor = PutFieldInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.PutFieldInteraction = PutFieldInteraction;
}(J$));