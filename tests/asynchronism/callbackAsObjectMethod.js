'use strict';

function AsyncObj() {
  this.callback = function () {};

  this.doSomethingAsync = function (a) {
    var dis = this;
    setTimeout(function () {
      dis.callback(a);
    }, 300);
  };
}

var a = new AsyncObj();
a.callback = function (a) {
  return a.someValue < 100;
};

a.doSomethingAsync({ someValue: 100 });
