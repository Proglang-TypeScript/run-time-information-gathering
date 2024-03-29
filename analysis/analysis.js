/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

'use strict';

(function (sandbox) {
  function Analysis() {
    this.addAnalysis = function (analysis) {
      if (analysis.callbackName) {
        this[analysis.callbackName] = analysis.callback;
      }
    };

    this.endExecution = function () {
      // eslint-disable-next-line no-console
      console.log('');
      // eslint-disable-next-line no-console
      var collator = new Intl.Collator(undefined, {numeric: true});
      const sorted = Object.keys(sandbox.runTimeInfo).sort(collator.compare).reduce((dict, key) => (dict[key] = sandbox.runTimeInfo[key], dict), {});
      console.log(JSON.stringify(sorted, null, 4));
    };
  }

  var thisAnalysis = new Analysis();
  Object.defineProperty(sandbox, 'analysis', {
    get: function () {
      return thisAnalysis;
    },
    set: function (a) {
      thisAnalysis.addAnalysis(a);
    },
  });

  if (sandbox.Constants.isBrowser) {
    // eslint-disable-next-line no-undef
    window.addEventListener('keydown', function (e) {
      // keyboard shortcut is Alt-Shift-T for now
      if (e.altKey && e.shiftKey && e.keyCode === 84) {
        sandbox.analysis.endExecution();
      }
    });
  }
})(J$);
