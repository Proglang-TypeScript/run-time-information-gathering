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

				mapShadowIdOfResultWithInteraction(
					f,
					functionContainer.declarationEnclosingFunctionId,
					result
				);
			}

			return {
				result: result
			};
		};

		function getFunctionContainer(functionIid) {
			return dis.runTimeInfo[functionIid];
		}

		function mapShadowIdOfResultWithInteraction(f, mapFunctionIid, result) {
			if (f.methodIdentifier && (f.methodIdentifier in dis.mapMethodIdentifierInteractions)) {
				var interaction = dis.mapMethodIdentifierInteractions[f.methodIdentifier];

				if (getTypeOf(result) == "object") {
					var shadowIdReturnedObject = dis.sMemoryInterface.getShadowIdOfObject(result);

					dis.mapShadowIdsInteractions[
						getHashForShadowIdAndFunctionIid(
							shadowIdReturnedObject,
							mapFunctionIid
						)
					] = interaction;
				}
			}
		}

	}

	exp.InvokeFun = InvokeFun;

})(module.exports);