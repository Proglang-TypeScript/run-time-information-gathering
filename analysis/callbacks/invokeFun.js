/* global module */
/* global require */

"use strict";

(function(exp) {
	var getTypeOf = require("../../utils/getTypeOf.js").getTypeOf;
	var getHashForShadowIdAndFunctionIid = require("../../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;

	function InvokeFun(runTimeInfo, sMemoryInterface, mapMethodIdentifierInteractions, mapShadowIdsInteractions) {
		var dis = this;

		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;
		this.mapMethodIdentifierInteractions = mapMethodIdentifierInteractions;
		this.mapShadowIdsInteractions = mapShadowIdsInteractions;

		this.runCallback = function(
			iid,
			f,
			base,
			args,
			result,
			isConstructor,
			isMethod,
			functionIid
		) {

			var functionContainer = getFunctionContainer(functionIid);

			if (functionContainer) {
				functionContainer.addReturnTypeOf(getTypeOf(result));

				if (f.methodIdentifier && (f.methodIdentifier in this.mapMethodIdentifierInteractions)) {
					var interaction = this.mapMethodIdentifierInteractions[f.methodIdentifier];

					if (getTypeOf(result) == "object") {
						var shadowIdReturnedObject = this.sMemoryInterface.getShadowIdOfObject(result);

						this.mapShadowIdsInteractions[
							getHashForShadowIdAndFunctionIid(
								shadowIdReturnedObject,
								functionContainer.declarationEnclosingFunctionId
							)
						] = interaction;
					}
				}
			}

			return {
				result: result
			};
		};

		function getFunctionContainer(functionIid) {
			return dis.runTimeInfo[functionIid];
		}
	}

	exp.InvokeFun = InvokeFun;

})(module.exports);