/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        this.addAnalysis = function(analysis) {
            if (analysis.callbackName) {
                this[analysis.callbackName] = analysis.callback;
            }
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