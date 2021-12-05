/* global J$ */

'use strict';

(function (sandbox) {
  function getTypeOf(val) {
    if (val === null) {
      return 'null';
    }

    if (typeof val === 'object' && val instanceof Array) {
      return 'array';
    }

    return typeof val;
  }

  function getTypeOfForReporting(val) {
    var argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;

    if (getTypeOf(val) == 'object') {
      if (val[argumentWrapperObjectBuilder.getOriginalTypeOfField()]) {
        return val[argumentWrapperObjectBuilder.getOriginalTypeOfField()];
      }

      if (val.constructor && val.constructor.name !== 'Object') {
        return val.constructor.name;
      }
    }

    return getTypeOf(val);
  }

  function getDeclarationEnclosingFunctionId(functionsExecutionStack) {
    if (!functionsExecutionStack.isThereAFunctionExecuting()) {
      return -1;
    }

    return functionsExecutionStack.getCurrentExecutingFunction();
  }

  function addDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack) {
    function propertyIsWritable(obj, key) {
      const description = Object.getOwnPropertyDescriptor(obj, key);

      return description !== undefined && description.writable === true;
    }

    const objects = [];

    function doAddDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack) {
      if (getTypeOf(val) == 'object') {
        if (objects.indexOf(val) === -1) {
          objects.push(val);

          for (var key in val) {
            if (propertyIsWritable(val, key)) {
              if (getTypeOf(val[key]) == 'function') {
                val[key].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(
                  functionsExecutionStack,
                );
              }

              doAddDeclarationFunctionIdToFunctionsInsideObject(val[key], functionsExecutionStack);
            }
          }
        }
      }

      return val;
    }

    return doAddDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack);
  }

  function getRandomIdentifier() {
    var now = new Date();
    return Math.floor(Math.random() * 1000 + 1).toString() + now.getTime();
  }

  sandbox.functions = {
    getTypeOf: getTypeOf,
    getTypeOfForReporting: getTypeOfForReporting,
    getDeclarationEnclosingFunctionId: getDeclarationEnclosingFunctionId,
    addDeclarationFunctionIdToFunctionsInsideObject: addDeclarationFunctionIdToFunctionsInsideObject,
    getRandomIdentifier: getRandomIdentifier,
  };
})(J$);
