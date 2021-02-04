function doSomethingWithCallback(a, cb) {
  return cb(a.firstName) + ' ' + cb(a.lastName);
}

function f(s) {
  return s.toUpperCase();
}

doSomethingWithCallback({ firstName: 'John', lastName: 'Doe' }, f);

doSomethingWithCallback({ firstName: 'John', lastName: 'Doe' }, f);

// 'JOHN DOE'
