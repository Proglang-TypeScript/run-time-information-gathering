/* global J$ */

'use strict';

const { produceMessage } = require('../../utils/kafka');

(function (sandbox) {
  function InvokeFunPreAnalysis() {
    this.callbackName = 'invokeFunPre';

    var FunctionContainer = sandbox.utils.FunctionContainer;
    var getTypeOf = sandbox.functions.getTypeOf;
    var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

    var UsedAsArgumentInteraction = sandbox.utils.UsedAsArgumentInteraction;

    var dis = this;

    this.runTimeInfo = sandbox.runTimeInfo;
    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;
    this.functionIdHandler = sandbox.utils.functionIdHandler;
    this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;
    this.objectTraceIdMap = sandbox.utils.objectTraceIdMap;

    this.callback = function (iid, f, base, args, isConstructor, isMethod, functionIid) {
      if (f !== undefined && !isConsoleLog(f) && f.name !== 'require') {
        if (!f.temporaryTraceId) {
          f.temporaryTraceId = dis.functionsExecutionStack.getTraceId();
        }

        for (var argIndex in args) {
          addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
          addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);

          if (f.isInstrumented === true) {
            convertToWrapperObject(args, argIndex);
          } else {
            convertToOriginalObject(args, argIndex);
          }
        }

        if (functionNotProcessed(f)) {
          var functionContainer = new FunctionContainer(f, isConstructor);
          functionContainer.functionIid = functionIid;

          dis.runTimeInfo[functionContainer.functionId] = functionContainer;

          // This command is equivalent to executing the
          // method `addFunctionContainer(functionId, functionContainer)`.
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
      }

      return {
        f: f,
        base: base,
        args: args,
        skip: f === undefined,
      };
    };

    function functionNotProcessed(f) {
      const functionId = dis.functionIdHandler.getFunctionId(f);
      return functionId && !(functionId in dis.runTimeInfo);
    }

    function isConsoleLog(f) {
      return (
        f.name === 'bound consoleCall' ||
        (f.name === 'log' && f.toString().indexOf('native code') !== -1)
      );
    }

    function addDeclarationEnclosingFunctionIdIfApplicable(val) {
      if (getTypeOf(val) == 'function') {
        if (!val.declarationEnclosingFunctionId) {
          val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(
            dis.functionsExecutionStack,
          );
        }
      }
    }

    function addUsedAsArgumentInteractionIfApplicable(val, f, argIndex) {
      const functionId = dis.functionIdHandler.getFunctionId(f);

      if (getTypeOf(val) == 'object') {
        const currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();

        const containerForAddingNewInteraction = dis.interactionContainerFinder.findInteraction(
          val,
        );
        if (currentActiveFiid && containerForAddingNewInteraction) {
          const usedAsArgumentInteraction = new UsedAsArgumentInteraction(
            currentActiveFiid,
            functionId,
            argIndex,
            f.temporaryTraceId,
          );

          const traceId = dis.objectTraceIdMap.get(val);
          if (traceId) {
            usedAsArgumentInteraction.traceId = traceId;
          }

          containerForAddingNewInteraction.addInteraction(usedAsArgumentInteraction);
        }
      }
    }

    function convertToWrapperObject(args, argIndex) {
      args[argIndex] = dis.wrapperObjectsHandler.convertToWrapperObject(args[argIndex]);
    }

    function convertToOriginalObject(args, argIndex) {
      args[argIndex] = dis.wrapperObjectsHandler.getFinalRealObjectFromProxy(args[argIndex]);
    }
  }

  sandbox.analysis = new InvokeFunPreAnalysis();
})(J$);
