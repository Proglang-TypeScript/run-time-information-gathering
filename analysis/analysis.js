/* global J$ */
/* global require */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        var analysisBuilder = new (require("./analysisBuilder.js")).AnalysisBuilder(
            sandbox
        );

        var callbacks = analysisBuilder.buildCallbacks();

        this.addAnalysis = function(analysis) {
            if (analysis.callbackName) {
                this[analysis.callbackName] = analysis.callback;
            }
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
            console.log(JSON.stringify(sandbox.runTimeInfo, null, 4));
        };
    }

    var thisAnalysis = new Analysis();
    Object.defineProperty(sandbox, 'analysis', {
        get:function () {
            return thisAnalysis;
        },
        set:function (a) {
            thisAnalysis.addAnalysis(a);
        }
    });

    sandbox.analysis = new Analysis();
}(J$));