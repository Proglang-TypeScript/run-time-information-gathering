/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        this.functionEnter = function (iid, f) {
            console.log("\nfunctionEnter:");
            console.log("\tiid: ", iid);
            console.log("\tf.name: ", f.name);
        };

        this.functionExit = function () {
            console.log("\nfunctionExit");
        };

        this.declare = function (iid, name, val, isArgument, argumentIndex) {
            console.log("\ndeclare:");
            console.log("\tiid: ", iid);
            console.log("\tname: ", name);
            console.log("\ttypeof val: ", typeof val);
            console.log("\tisArgument: ", isArgument);
            console.log("\targumentIndex: ", argumentIndex);
        };

        this.write = function (iid, name, val, lhs, isGlobal, isScriptLocal) {
            console.log("\nwrite:");
            console.log("\tiid: ", iid);
            console.log("\tname: ", name);
            console.log("\tval: ", val);
            console.log("\tlhs: ", lhs);
            console.log("\tisGlobal: ", isGlobal);
            console.log("\tisScriptLocal: ", isScriptLocal);
        };

        this.invokeFunPre = function(
            iid,
            f,
            base,
            args,
            isConstructor,
            isMethod,
            functionIid
        ) {
            console.log("\ninvokeFunPre:");
            console.log("\tiid: ", iid);
            console.log("\tf.name: ", f.name);
            console.log("\targs: ", args);
            console.log("\tisConstructor: ", isConstructor);
            console.log("\tisMethod: ", isMethod);
            console.log("\tfunctionIid: ", functionIid);
        };

        this.getFieldPre = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
        ) {
            console.log("\ngetFieldPre:");
            console.log("\tiid: ", iid);
            console.log("\tbase: ", base);
            console.log("\toffset: ", offset);
            console.log("\tisComputed: ", isComputed);
            console.log("\tisOpAssign: ", isOpAssign);
            console.log("\tisMethodCall: ", isMethodCall);
        };

        this.putFieldPre = function (iid, base, offset, val, isComputed, isOpAssign) {
            console.log("\nputFieldPre:");
            console.log("\tiid: ", iid);
            console.log("\tbase: ", base);
            console.log("\toffset: ", offset);
            console.log("\ttypeof val: ", typeof val);
            console.log("\tisComputed: ", isComputed);
            console.log("\tisOpAssign: ", isOpAssign);
        };

        this.endExecution = function() {
            console.log("\nendExecution");
        };
    }

    sandbox.analysis = new Analysis();
}(J$));