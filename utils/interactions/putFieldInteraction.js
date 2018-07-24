/* global module */
/* global require */

"use strict";

(function(exp) {
	var ActiveInteraction = require("./activeInteraction.js").ActiveInteraction;

	function PutFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'setField';

		this.typeof = null;
	}

	PutFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	PutFieldInteraction.prototype.constructor = PutFieldInteraction;

	exp.PutFieldInteraction = PutFieldInteraction;

})(module.exports);