/* global J$ */

'use strict';

(function (sandbox) {
  const Interaction = sandbox.utils.Interaction;
  const getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;
  const functionIdHandler = sandbox.utils.functionIdHandler;

  function InputValueInteraction(val) {
    Interaction.call(this);

    this.code = 'inputValue';
    this.typeof = getTypeOfForReporting(val);
    this.functionId = undefined;

    if (this.typeof === 'function') {
      this.functionId = functionIdHandler.getFunctionId(val);
    }
  }

  InputValueInteraction.prototype = Object.create(Interaction.prototype);
  InputValueInteraction.prototype.constructor = InputValueInteraction;

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.InputValueInteraction = InputValueInteraction;
})(J$);
