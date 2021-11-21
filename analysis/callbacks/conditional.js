/* global J$ */

'use strict';

(function (sandbox) {
  function ConditionalAnalysis() {
    this.callbackName = 'conditional';

    this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
    this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;
    this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

    this.operatorInteractionBuilder = sandbox.utils.operatorInteractionBuilder;

    var dis = this;

    this.callback = function (iid, result) {
      let newResult = result;

      if (dis.wrapperObjectsHandler.objectIsWrapperObject(result)) {
        const finalRealValueFromWrapperObject = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(
          result,
        );

        if (
          finalRealValueFromWrapperObject === undefined ||
          finalRealValueFromWrapperObject === null
        ) {
          newResult = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result);
        }
      }

      const leftOperatorInteraction = dis.operatorInteractionBuilder.build(
        'conditional',
        dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(result),
        undefined,
      );

      if (addInteractionIfNecessary(leftOperatorInteraction, result) === true) {
        leftOperatorInteraction.operandForInteraction = 'left';
      }

      return {
        result: newResult,
      };
    };

    function addInteractionIfNecessary(interaction, operand) {
      const interactionContainer = dis.interactionContainerFinder.findInteraction(operand);

      if (interactionContainer) {
        const traceId = dis.objectTraceIdMap.get(operand);

        if (traceId) {
          interaction.traceId = traceId;
        }

        interactionContainer.addInteraction(interaction);

        return true;
      } else {
        return false;
      }
    }
  }

  sandbox.analysis = new ConditionalAnalysis();
})(J$);
