/* global J$ */

"use strict";

(function (sandbox) {
	function OperatorsTypeCoercionAnalyzer() {
		let operatorsTypeCoercion = [
			sandbox.utils.RelationalComparisonOperatorTypeCoercion
		];

		this.mapOperatorsTypeCoercion = {};

		operatorsTypeCoercion.forEach(operatorTypeCoercion => {
			operatorTypeCoercion.operators.forEach(operator => {
				if (operator in this.mapOperatorsTypeCoercion) {
					throw new Error("There is already one type corecion handler for operator: '" + operator + "'");
				}

				this.mapOperatorsTypeCoercion[operator] = operatorTypeCoercion;
			});
		});

		this.analyzeTypeCoercion = function(operator, left, right) {
			if (!(operator in this.mapOperatorsTypeCoercion)) {
				return null;
			}

			return this.mapOperatorsTypeCoercion[operator].getTypeCoercion(left, right);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.operatorsTypeCoercionAnalyzer = new OperatorsTypeCoercionAnalyzer();
}(J$));