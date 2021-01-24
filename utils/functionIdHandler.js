/* global J$ */

'use strict';

(function (sandbox) {
  function FunctionIdHandler() {
    let counter = 1;
    const prefix = 'functionId_';
    const functionIdField = 'functionId';

    this.getFunctionId = function (f) {
      if (f[functionIdField] === undefined) {
        f[functionIdField] = prefix + counter.toString();
        counter += 2;
      }

      return f[functionIdField];
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.functionIdHandler = new FunctionIdHandler();
})(J$);
