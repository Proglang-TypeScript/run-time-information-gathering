/* global J$ */

'use strict';

(function (sandbox) {
  function PutFieldPreAnalysis() {
    this.callbackName = 'putFieldPre';

    var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;
    var getTypeOf = sandbox.functions.getTypeOf;
    var addDeclarationFunctionIdToFunctionsInsideObject =
      sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

    var PutFieldInteraction = sandbox.utils.PutFieldInteraction;

    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
    this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

    var dis = this;

    this.callback = function (iid, base, offset, val, isComputed, isOpAssign) {
      val = addDeclarationEnclosingFunctionId(val);

      var interaction = getPutFieldInteracion(iid, base, offset, val, isComputed, isOpAssign);

      if (!addInteractionToContainerIfPossible(interaction, base)) {
        addFollowingInteractionToMappedInteraction(interaction, base);
      }

      return {
        base: base,
        offset: offset,
        val: val,
        skip: false,
      };
    };

    function addInteractionToContainerIfPossible(interaction, base) {
      const containerForAddingNewInteraction = dis.interactionContainerFinder.findInteraction(base);

      let interactionAdded = false;
      if (containerForAddingNewInteraction) {
        containerForAddingNewInteraction.addInteraction(interaction);
        interactionAdded = true;
      }

      return interactionAdded;
    }

    function addFollowingInteractionToMappedInteraction(interaction, base) {
      var containerForAddingNewInteraction = dis.interactionContainerFinder.findInteraction(base);

      if (containerForAddingNewInteraction) {
        containerForAddingNewInteraction.addInteraction(interaction);
      }
    }

    function addDeclarationEnclosingFunctionId(val) {
      if (getTypeOf(val) == 'function') {
        val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(
          dis.functionsExecutionStack,
        );
      } else {
        val = addDeclarationFunctionIdToFunctionsInsideObject(val, dis.functionsExecutionStack);
      }

      return val;
    }

    function getPutFieldInteracion(iid, base, offset, val, isComputed, isOpAssign) {
      var interaction = new PutFieldInteraction(iid, offset);

      interaction.typeof = getTypeOf(val);
      interaction.isComputed = isComputed;
      interaction.isOpAssign = isOpAssign;
      interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

      const traceId = dis.objectTraceIdMap.get(base);
      if (traceId) {
        interaction.traceId = traceId;
      }

      return interaction;
    }
  }

  sandbox.analysis = new PutFieldPreAnalysis();
})(J$);
