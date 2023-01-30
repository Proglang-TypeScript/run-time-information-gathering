/* global J$ */

'use strict';

const { produceMessage } = require('../../utils/kafka');

(function (sandbox) {
  function InvokeFunAnalysis() {
    this.callbackName = 'invokeFun';

    this.runTimeInfo = sandbox.runTimeInfo;
    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;
    this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
    this.metadataStore = sandbox.utils.metadataStore;

    var dis = this;

    this.callback = function (iid, f, base, args, result) {
      if (f !== undefined) {
        var functionContainer = getFunctionContainer(f);

        if (functionContainer) {
          if (dis.metadataStore.get(f, 'lastInteraction')) {
            var interaction = dis.metadataStore.get(f, 'lastInteraction');
            interaction.setReturnTypeOf(result);

            result = changeResultToWrapperObjectIfItIsALiteral(result);

            dis.interactionWithResultHandler.processInteractionWithResult(
              interaction,
              result,
              base,
            );
          }

          const lastStopped = dis.functionsExecutionStack.getLastStopped();
          functionContainer.addReturnTypeOf(
            result,
            lastStopped ? lastStopped.traceId : null,
            dis.metadataStore.get(f, 'declarationTraceId'),
          );

          if (functionContainer.isConstructor === true) {
            iterateObjectProperties(result, function (key, obj) {
              const value = obj[key];

              if (typeof value === 'function') {
                value['__CONSTRUCTED_BY__'] = functionContainer.functionId;
              }
            });
          }
          const message = {
            command: 'add-function-container',
            data: {
              functionId: functionContainer.functionId,
              functionContainer,
            },
          };
  
          // eslint-disable-next-line no-console
          produceMessage(message).catch((err) => console.log(err));

        }

        if (f.name === 'require') {
          const requiredModule = result;
          const nameOfRequiredModule = args[0];

          if (typeof requiredModule === 'function') {
            requiredModule['__IS_EXPORTED_FUNCTION__'] = true;
            requiredModule['__REQUIRED_MODULE__'] = nameOfRequiredModule;
          }

          iterateObjectProperties(requiredModule, function (key, obj) {
            const value = obj[key];

            if (typeof value === 'function' && value !== requiredModule) {
              value['__IS_EXPORTED_FUNCTION__'] = false;
              value['__REQUIRED_MODULE__'] = nameOfRequiredModule;
            }
          });
        }

      }

      return {
        result: result,
      };
    };

    function changeResultToWrapperObjectIfItIsALiteral(result) {
      return dis.wrapperObjectsHandler.convertToWrapperObject(result);
    }

    function getFunctionContainer(f) {
      return dis.runTimeInfo[f.functionId];
    }

    function iterateObjectProperties(obj, f) {
      for (const key in obj) {
        f(key, obj);
      }
    }
  }

  sandbox.analysis = new InvokeFunAnalysis();
})(J$);
