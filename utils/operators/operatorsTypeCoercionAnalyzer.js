/* global J$ */

"use strict";

(function (sandbox) {
	function OperatorsTypeCoercionAnalyzer() {
		let operatorsTypeCoercion = [
			sandbox.utils.relationalComparisonOperatorTypeCoercion,
			sandbox.utils.sumOperatorTypeCoercion
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

			let typeCoercion = this.mapOperatorsTypeCoercion[operator].getTypeCoercion(left, right);

			if (typeCoercion.left) {
				typeCoercion.left.operator = operator;
			}

			if (typeCoercion.right) {
				typeCoercion.right.operator = operator;
			}

			return typeCoercion;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.operatorsTypeCoercionAnalyzer = new OperatorsTypeCoercionAnalyzer();
}(J$));