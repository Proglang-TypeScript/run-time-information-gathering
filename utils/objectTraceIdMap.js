/* global J$ */

'use strict';

(function (sandbox) {
  function ObjectTraceIdMap() {
    const map = new WeakMap();

    this.set = function (obj, traceId) {
      try {
        map.set(obj, traceId);
        // eslint-disable-next-line no-empty
      } catch (error) {}
    };

    this.get = function (obj) {
      return map.get(obj);
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.objectTraceIdMap = new ObjectTraceIdMap();
})(J$);
