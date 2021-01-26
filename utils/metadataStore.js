/* global J$ */

'use strict';

(function (sandbox) {
  function MetadataStore() {
    const store = new WeakMap();

    this.set = function (obj, key, value) {
      let metadata = store.get(obj);

      if (!metadata) {
        metadata = new Map();
        store.set(obj, metadata);
      }

      metadata.set(key, value);
    };

    this.get = function (obj, key) {
      const metadata = store.get(obj);

      if (!metadata) {
        return undefined;
      }

      return metadata.get(key);
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.metadataStore = new MetadataStore();
})(J$);
