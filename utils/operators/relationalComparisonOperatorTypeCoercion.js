/* global J$ */

'use strict';

(function (sandbox) {
  function RelationalComparisonOperatorTypeCoercion(getTypeOf) {
    this.toPrimitive = sandbox.utils.toPrimitive;
    this.interactionContainerFinder = sandbox.utils.interactionContainerFinder;

    this.operators = ['<', '>', '<=', '>='];

    this.getTypeCoercion = function (left, right) {
      const ConvertedToInteraction = sandbox.utils.ConvertedToInteraction;

      const leftPrimitive = this.toPrimitive(left, Number);
      const rightPrimitive = this.toPrimitive(right, Number);

      const leftConvertedTo = new ConvertedToInteraction();
      leftConvertedTo.originalTypeof = getTypeOf(left);
      const rightConvertedTo = new ConvertedToInteraction();
      rightConvertedTo.originalTypeof = getTypeOf(right);

      if (leftPrimitive !== left) {
        leftConvertedTo.addToPrimitive('number', sandbox.functions.getTypeOf(leftPrimitive));
        left = leftPrimitive;
      }

      if (rightPrimitive !== right) {
        rightConvertedTo.addToPrimitive('number', sandbox.functions.getTypeOf(rightPrimitive));
        right = rightPrimitive;
      }

      const typeOfLeft = sandbox.functions.getTypeOf(left);
      const typeOfRight = sandbox.functions.getTypeOf(right);

      if (!(typeOfLeft === 'string' && typeOfRight === 'string')) {
        leftConvertedTo.convertedTo = 'number';
        leftConvertedTo.isNaN = isNaN(left);

        rightConvertedTo.convertedTo = 'number';
        rightConvertedTo.isNaN = isNaN(right);
      } else {
        leftConvertedTo.convertedTo = 'string';
        rightConvertedTo.convertedTo = 'string';
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

  sandbox.utils.relationalComparisonOperatorTypeCoercion = new RelationalComparisonOperatorTypeCoercion(
    sandbox.functions.getTypeOf,
  );
})(J$);
