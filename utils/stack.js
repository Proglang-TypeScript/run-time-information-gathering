/* global module */

"use strict";

(function(exp) {

	function Stack() {
		this.s = [];

		this.push = function(data) {
			this.s.push(data);
		};

		this.pop = function() {
			return this.s.pop();
		};

		this.top = function() {
			if (this.s.length === 0) {
				return null;
			}

			return this.s[this.s.length - 1];
		};

		this.isEmpty = function() {
			return (this.s.length === 0);
		};
	}

	exp.Stack = Stack;

})(module.exports);