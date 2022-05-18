/* global J$ */

'use strict';

const { produceMessage } = require('../../utils/kafka');

(function (sandbox) {
  function FunctionEnterAnalysis() {
    this.callbackName = 'functionEnter';

    var FunctionContainer = sandbox.utils.FunctionContainer;

    this.runTimeInfo = sandbox.runTimeInfo;
    this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
    this.functionIdHandler = sandbox.utils.functionIdHandler;

    var dis = this;

    this.callback = function (iid, f) {
      if (f.proxyMethod) {
        f = f.proxyMethod;
      }

      const functionId = dis.functionIdHandler.getFunctionId(f);
      let functionContainer;

      if (functionNotProcessed(f)) {
        functionContainer = new FunctionContainer(f);

        dis.runTimeInfo[functionId] = functionContainer;

        const message = {
          command: 'add-function-container',
          data: {
            functionId: functionContainer.functionId,
            functionContainer,
          },
        };

        // eslint-disable-next-line no-console
        produceMessage(message).catch((err) => console.log(err));
      } else {
        functionContainer = dis.runTimeInfo[functionId];
      }
      functionContainer.functionIid = iid;

      dis.functionsExecutionStack.addExecution(f);
    };

    function functionNotProcessed(f) {
      const functionId = dis.functionIdHandler.getFunctionId(f);
      return functionId && !(functionId in dis.runTimeInfo);
    }
  }

  sandbox.analysis = new FunctionEnterAnalysis();
})(J$);
