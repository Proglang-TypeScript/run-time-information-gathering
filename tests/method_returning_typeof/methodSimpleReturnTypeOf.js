'use strict';

function executeFunctions(obj) {
  obj.returnString();
  obj.returnNumber();
  obj.returnFunction();
  obj.returnObject();
}

var a = {
  returnString: function () {
    return 'hello';
  },
  returnNumber: function () {
    return 123;
  },
  returnFunction: function () {
    var f = function () {
      return 123;
    };

    return f;
  },
  returnObject: function () {
    return {
      someValue: 100,
    };
  },
};

executeFunctions(a);
