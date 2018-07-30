/* global module */
/* global require */

"use strict";

(function(exp) {
	var MethodCallInteraction = require("../../utils/interactions/methodCallInteraction.js").MethodCallInteraction;
	var GetFieldInteraction = require("../../utils/interactions/getFieldInteraction.js").GetFieldInteraction;

	function GetFieldPre(
		functionsExecutionStack,
		sMemoryInterface,
		functionIdHandler,
		interactionWithResultHandler
	) {
		this.functionsExecutionStack = functionsExecutionStack;
		this.sMemoryInterface = sMemoryInterface;
		this.functionIdHandler = functionIdHandler;
		this.interactionWithResultHandler = interactionWithResultHandler;

		var dis = this;

		this.runCallback = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
		) {
			if (isMethodCall === true) {
				processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid);
			} else {
				processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid);
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};

		function processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var getFieldInteraction = getGetFieldInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			dis.interactionWithResultHandler.processResultOfInteraction(
				getFieldInteraction,
				dis.functionsExecutionStack.getCurrentExecutingFunction(),
				base[offset],
				base
			);
		}

		function getGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new GetFieldInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			interaction.setReturnTypeOf(base[offset]);

			return interaction;
		}

		function processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			base[offset].methodName = offset;

			var methodCallInteraction = getMethodCallInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			addFunctionIdToInteraction(methodCallInteraction, base[offset]);
		}

		function getMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new MethodCallInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}

		function addFunctionIdToInteraction(interaction, f) {
			let functionId = dis.functionIdHandler.setFunctionId(f);

			interaction.functionId = functionId;
			f.lastInteraction = interaction;
		}
	}

	exp.GetFieldPre = GetFieldPre;

})(module.exports);