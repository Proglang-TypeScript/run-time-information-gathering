/* global J$ */

'use strict';

(function (sandbox) {
  function ArgumentProxyBuilder() {
    this.proxyMethodsIdentifier = '%%PROXY_METHOD%%';

    var dis = this;

    this.buildProxy = function (obj) {
      return new Proxy(obj, {
        get: function (target, property) {
          if (property === 'IS_WRAPPER_OBJECT') {
            return true;
          }

          if (property === 'TARGET_PROXY') {
            return target;
          }

          if (typeof target[property] === 'function' && property !== 'constructor') {
            if (!isProxyMethod(target, property)) {
              const origMethod = target[property];
              var f = cloneMethod(origMethod, target);

              target[getModifiedPropertyName(property)] = f;
              origMethod.proxyMethod = f;
            }

            return target[getModifiedPropertyName(property)];
          }

          return target[property];
        },
      });
    };

    function transformToString(property) {
      if (typeof property === 'symbol') {
        return property.toString();
      }

      return property;
    }

    function getModifiedPropertyName(property) {
      return transformToString(property) + dis.proxyMethodsIdentifier;
    }

    function cloneMethod(origMethod, target) {
      var f = function () {
        try {
          return origMethod.apply(this, arguments);
        } catch (error) {
          if (error instanceof TypeError) {
            return origMethod.apply(target, arguments);
          } else {
            throw error;
          }
        }
      };

      for (var key in origMethod) {
        if (Object.prototype.hasOwnProperty.call(origMethod, key)) {
          f[key] = origMethod[key];
        }
      }

      return f;
    }

    function isProxyMethod(target, property) {
      return target[getModifiedPropertyName(property)] !== undefined;
    }
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.argumentProxyBuilder = new ArgumentProxyBuilder();
})(J$);
