"use strict";

function traverse(a) {
	var l = a;
	var sum = 0;

	while(l !== null) {
		sum += l.val;

		if (l.useRight) {
			l = l.right;
		} else {
			l = l.left;
		}
	}

	return sum;
}

function Node(val) {
	this.val = val;
	this.left = null;
	this.right = null;
	this.useRight = false;
}

function AnotherNode(val) {
	this.val = val;
	this.left = null;
	this.right = null;
	this.useRight = false;
}

var a1 = new Node(1);
var a2 = new Node(2);
var a3 = new Node(3);
var a4 = new Node(4);
var a5 = new Node(5);
var a6 = new Node(6);

var a7 = new Node(7);
var a8 = new Node(8);
var a9 = new Node(9);
var a10 = new Node(10);

var a70 = new Node(70);

a1.left = a2;
a2.left = a3;
a3.left = a4;
a4.left = a5;
a5.left = a6;
a6.left = a7;
a7.left = a8;
a8.left = a9;
a9.left = a10;

a7.useRight = true;
a7.right = a70;

var s = traverse(a1);
console.log(s);