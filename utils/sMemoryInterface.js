/* global J$ */

const nanoId = require('nanoid').nanoid;

('use strict');

(function (sandbox) {
  function SMemoryInterface() {
    this.shadowObjectsMap = new WeakMap();

    this.getShadowIdOfObject = function (obj) {
      if (!this.shadowObjectsMap.has(obj)) {
        try {
          this.shadowObjectsMap.set(obj, nanoId());
        } catch (error) {
          return null;
        }
      }

      return this.shadowObjectsMap.get(obj) || null;
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.sMemoryInterface = new SMemoryInterface();
})(J$);
