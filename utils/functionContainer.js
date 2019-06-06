/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;

	function FunctionContainer(f, isConstructor) {
		let dis = this;

		this.functionId = f.functionId;
		this.functionName = getFunctionName(f, isConstructor);

		this.isConstructor = (isConstructor === true);
		this.args = {};
		this.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;
		this.returnTypeOfs = [];
		this.functionIid = null;
		this.requiredModule = getRequiredModule(f);
		this.isExported = (f["__IS_EXPORTED_FUNCTION__"] === true);
		this.constructedBy = f["__CONSTRUCTED_BY__"] ? f["__CONSTRUCTED_BY__"] : ""

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

		function getFunctionName(f, isConstructor) {
			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			if (!functionName) {
				functionName = convertToCamelCase(getRequiredModule(f), isConstructor);
			}

			return functionName;
		}

		function convertToCamelCase(m, isConstructor) {
			let moduleName = m.replace(/^.*[\/]/, '').replace(/\.[^/.]+$/, "");

			let converted = moduleName.replace(/([-_][a-z])/ig, ($1) => {
				return $1.toUpperCase()
					.replace('-', '')
					.replace('_', '');
			});

			if (isConstructor === true) {
				converted = converted.charAt(0).toUpperCase() + converted.slice(1)
			}

			return converted;
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.FunctionContainer = FunctionContainer;
}(J$));