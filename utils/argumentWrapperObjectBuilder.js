/* global J$ */

'use strict';

(function (sandbox) {
  function ArgumentWrapperObjectBuilder() {
    this.getOriginalTypeOfField = function () {
      return '__ORIGINAL_TYPEOF__';
    };

    this.buildFromString = function (val) {
      const wrapperObj = new String(val);
      wrapperObj.TARGET_PROXY = val;
      wrapperObj.IS_WRAPPER_OBJECT = true;

      wrapperObj[this.getOriginalTypeOfField()] = 'string';

      return wrapperObj;
    };

    this.buildFromNumber = function (val) {
      const wrapperObj = new Number(val);
      wrapperObj.TARGET_PROXY = val;
      wrapperObj.IS_WRAPPER_OBJECT = true;

      wrapperObj[this.getOriginalTypeOfField()] = 'number';

      return wrapperObj;
    };

    this.buildFromUndefined = function (val) {
      if (val !== undefined) {
        return val;
      }

      const undefinedObj = {};
      undefinedObj.valueOf = function () {
        return undefined;
      };

      undefinedObj.toString = function () {
        return String(undefined);
      };

      undefinedObj[this.getOriginalTypeOfField()] = 'undefined';
      undefinedObj.TARGET_PROXY = undefined;
      undefinedObj.IS_WRAPPER_OBJECT = true;

      return undefinedObj;
    };

    this.buildFromNull = function (val) {
      if (val !== null) {
        return val;
      }

      const nullObj = {};
      nullObj.valueOf = function () {
        return null;
      };

      nullObj.toString = function () {
        return String(null);
      };

      nullObj[this.getOriginalTypeOfField()] = 'null';
      nullObj.TARGET_PROXY = null;
      nullObj.IS_WRAPPER_OBJECT = true;

      return nullObj;
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.argumentWrapperObjectBuilder = new ArgumentWrapperObjectBuilder();
})(J$);
