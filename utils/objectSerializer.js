/* global J$ */

'use strict';

(function (sandbox) {
  var getTypeOf = sandbox.functions.getTypeOf;

  function ObjectSerializer() {
    this.serializeStructure = function (obj) {
      var objSerialized = '';

      if (getTypeOf(obj) == 'object') {
        var objKeys = Object.keys(obj).sort();

        objSerialized = JSON.stringify(objKeys);

        var constructorName = obj.constructor ? obj.constructor.name : '';
        objSerialized += '__constructorName__: ' + constructorName;
      }

      return objSerialized;
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.objectSerializer = new ObjectSerializer();
})(J$);
