/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;

	function FunctionContainer(f, isConstructor) {
		let dis = this;

		this.functionId = f.functionId;
		this.functionName = getFunctionName(f);

		this.isConstructor = (isConstructor === true);
		this.args = {};
		this.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;
		this.returnTypeOfs = [];
		this.functionIid = null;
		this.requiredModule = getRequiredModule(f);
		this.isExported = (f["__IS_EXPORTED_FUNCTION__"] === true);

		function getRequiredModule(f) {
			return f["__REQUIRED_MODULE__"] ? f["__REQUIRED_MODULE__"] : ""
		}

		this.addArgumentContainer = function(argumentIndex, argumentContainer) {
			if (!(argumentIndex in this.args)) {
				this.args[argumentIndex] = argumentContainer;
			} else {
				argumentContainer.interactions = this.args[argumentIndex].interactions.concat(argumentContainer.interactions);
				this.args[argumentIndex] = argumentContainer;
			}
		};

		this.addReturnTypeOf = function(returnValue, traceId) {
			let returnTypeOf = {
				typeOf: getTypeOfForReporting(returnValue),
				traceId: traceId
			}

			this.returnTypeOfs.push(returnTypeOf);
		};

		this.getArgumentContainer = function(argumentIndex) {
			return this.args[argumentIndex];
		};

		function getFunctionName(f) {
			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			if (!functionName) {
				functionName = convertToCamelCase(getRequiredModule(f));
			}

			return functionName;
		}

		function convertToCamelCase(m) {
			let moduleName = m.replace(/^.*[\/]/, '').replace(/\.[^/.]+$/, "");

			return moduleName.replace(/([-_][a-z])/ig, ($1) => {
				return $1.toUpperCase()
					.replace('-', '')
					.replace('_', '');
			});
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.FunctionContainer = FunctionContainer;
}(J$));