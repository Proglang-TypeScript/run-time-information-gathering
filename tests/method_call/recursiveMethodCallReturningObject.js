'use strict';

function traverse(a) {
  var l = a;
  var sum = 0;

  while (l !== null) {
    sum += l.val;

    if (l.useRight) {
      l = l.getRight();
    } else {
      l = l.getLeft();
    }
  }

  return sum;
}

function Node(val, left, right) {
  this.val = val;
  this.useRight = false;

  this.getLeft = function () {
    return left;
  };

  this.getRight = function () {
    return right;
  };
}

function AnotherNode(val, left, right) {
  this.val = val;
  this.useRight = false;

  this.getLeft = function () {
    return left;
  };

  this.getRight = function () {
    return right;
  };
}

var a10 = new Node(10, null, null);
var a9 = new Node(9, a10, null);
var a8 = new Node(8, a9, null);
var a7 = new AnotherNode(7, null, a8);
var a6 = new Node(6, a7, null);
var a5 = new Node(5, a6, null);
var a4 = new Node(4, null, a5);
var a3 = new Node(3, a4, null);
var a2 = new Node(2, a3, null);
var a1 = new Node(1, a2, null);

a4.useRight = true;

traverse(a1);
