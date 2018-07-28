/* global J$ */
/* global require */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        var runTimeInfo = {};

        var analysisBuilder = new (require("./analysisBuilder.js")).AnalysisBuilder(
            sandbox,
            runTimeInfo
        );

        var callbacks = analysisBuilder.buildCallbacks();

        this.functionEnter = function(iid, f) {
            return callbacks.functionEnter.runCallback(iid, f);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            return callbacks.functionExit.runCallback(iid, returnVal, wrappedExceptionVal);
        };

        this.declare = function(iid, name, val, isArgument, argumentIndex) {
            return callbacks.declare.runCallback(iid, name, val, isArgument, argumentIndex);
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
            return callbacks.invokeFunPre.runCallback(
                iid,
                f,
                base,
                args,
                isConstructor,
                isMethod,
                functionIid
            );
        };

        this.invokeFun = function (
            iid,
            f,
            base,
            args,
            result,
            isConstructor,
            isMethod,
            functionIid
        ) {
            return callbacks.invokeFun.runCallback(
                iid,
                f,
                base,
                args,
                result,
                isConstructor,
                isMethod,
                functionIid
            );
        };

        this.getFieldPre = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
        ) {
            return callbacks.getFieldPre.runCallback(
                iid,
                base,
                offset,
                isComputed,
                isOpAssign,
                isMethodCall
            );
        };

        this.putFieldPre = function(iid, base, offset, val, isComputed, isOpAssign) {
            return callbacks.putFieldPre.runCallback(
                iid,
                base,
                offset,
                val,
                isComputed,
                isOpAssign
            );
        };

        this.write = function (iid, name, val) {
            return callbacks.write.runCallback(val);
        };

        this.binaryPre = function (iid, op, left, right) {
            return callbacks.binaryPre.runCallback(
                iid,
                op,
                left,
                right
            );
        };

        this.unaryPre = function (iid, op, left) {
            return callbacks.unaryPre.runCallback(iid, op, left);
        };

        this.endExecution = function() {
            console.log(JSON.stringify(runTimeInfo, null, 4));
        };
    }

    sandbox.analysis = new Analysis();
}(J$));