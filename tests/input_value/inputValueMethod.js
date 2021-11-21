/* eslint-disable no-unused-vars */
'use strict';

var a = {
  f: function (a, b) {
    return a;
  },
  f2: function (a) {
    return a;
  },
};

a.f('hello', 'world');
a.f(1, 2);
a.f({}, {});
a.f(32);

a.f2(null);
