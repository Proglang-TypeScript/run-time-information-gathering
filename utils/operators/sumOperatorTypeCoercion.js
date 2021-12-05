/* global J$ */

'use strict';

(function (sandbox) {
  function SumOperatorTypeCoercion(getTypeOf) {
    this.toPrimitive = sandbox.utils.toPrimitive;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;

    this.operators = ['+'];

    this.getTypeCoercion = function (left, right) {
      const ConvertedToInteraction = sandbox.utils.ConvertedToInteraction;

      const leftPrimitive = this.toPrimitive(left);
      const rightPrimitive = this.toPrimitive(right);

      const leftConvertedTo = new ConvertedToInteraction();
      leftConvertedTo.originalTypeof = getTypeOf(left);
      const rightConvertedTo = new ConvertedToInteraction();
      rightConvertedTo.originalTypeof = getTypeOf(left);

      if (leftPrimitive !== left) {
        leftConvertedTo.addToPrimitive('default', sandbox.functions.getTypeOf(leftPrimitive));
        left = leftPrimitive;
      }

      if (rightPrimitive !== right) {
        rightConvertedTo.addToPrimitive('default', sandbox.functions.getTypeOf(rightPrimitive));
        right = rightPrimitive;
      }

      const typeOfLeft = getTypeOf(left);
      const typeOfRight = getTypeOf(right);

      if (typeOfLeft === 'string' || typeOfRight === 'string') {
        leftConvertedTo.convertedTo = 'string';
        rightConvertedTo.convertedTo = 'string';
      } else {
        leftConvertedTo.convertedTo = 'number';
        leftConvertedTo.isNaN = isNaN(left);

        rightConvertedTo.convertedTo = 'number';
        rightConvertedTo.isNaN = isNaN(right);
      }

      return {
        left: leftConvertedTo,
        right: rightConvertedTo,
      };
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.sumOperatorTypeCoercion = new SumOperatorTypeCoercion(sandbox.functions.getTypeOf);
})(J$);
