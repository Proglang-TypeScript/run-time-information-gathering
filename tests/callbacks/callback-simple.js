function doSomethingWithCallback(a, cb) {
  return cb(a.firstName) + ' ' + cb(a.lastName);
}

doSomethingWithCallback({ firstName: 'John', lastName: 'Doe' }, function (s) {
  return s.toUpperCase();
});

// 'JOHN DOE'
