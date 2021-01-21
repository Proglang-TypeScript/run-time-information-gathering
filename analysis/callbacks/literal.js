/* global J$ */

'use strict';

(function (sandbox) {
  function LiteralAnalysis() {
    this.callbackName = 'literal';

    this.callback = function (iid, val) {
      if (typeof val === 'function') {
        val.isInstrumented = true;
      }

      return {
        result: val,
      };
    };
  }

  sandbox.analysis = new LiteralAnalysis();
})(J$);
