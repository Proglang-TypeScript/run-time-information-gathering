/* global J$ */

'use strict';

const { produceMessage } = require('../../utils/kafka');

(function (sandbox) {
  function DeclareAnalysis() {
    this.callbackName = 'declare';

    var ArgumentContainer = sandbox.utils.ArgumentContainer;
    var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

    var InputValueInteraction = sandbox.utils.InputValueInteraction;

    this.runTimeInfo = sandbox.runTimeInfo;
    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
    this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;
    this.metadataStore = sandbox.utils.metadataStore;

    var dis = this;

    this.callback = function (iid, name, val, isArgument, argumentIndex) {
      if (isAnArgumentOfAProcessedFunction(argumentIndex, isArgument)) {
        var functionContainer = getFunctionContainer();

        if (functionContainer) {
          var argumentContainer = buildArgumentContainer(argumentIndex, name, val);
          functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

          const message = {
            command: 'add-argument-container',
            data: {
              argumentIndex,
              argumentContainer,
              functionId: functionContainer.functionId,
            },
          };

          // eslint-disable-next-line no-console
          produceMessage(message).catch((err) => console.log(err));

          dis.interactionContainerFinder.addMapping(argumentContainer, val);
        }
      }

      if (typeof val == 'function') {
        val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(
          dis.functionsExecutionStack,
        );
        val.isInstrumented = true;

        dis.metadataStore.set(val, 'declarationTraceId', dis.objectTraceIdMap.get(val));
      }

      return {
        result: val,
      };
    };

    function isAnArgumentOfAProcessedFunction(argumentIndex, isArgument) {
      return (
        argumentIndex >= 0 &&
        isArgument === true &&
        dis.functionsExecutionStack.isThereAFunctionExecuting()
      );
    }

    function getFunctionContainer() {
      const functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
      return dis.runTimeInfo[functionId];
    }

    function buildArgumentContainer(argumentIndex, name, val) {
      var argumentContainer = new ArgumentContainer(argumentIndex, name);

      const interaction = new InputValueInteraction(val);

      const execution = dis.functionsExecutionStack.getCurrentExecution();
      interaction.traceId = execution.traceId;

      argumentContainer.addInteraction(interaction);

      dis.objectTraceIdMap.set(val, execution.traceId);

      return argumentContainer;
    }
  }

  sandbox.analysis = new DeclareAnalysis();
})(J$);
