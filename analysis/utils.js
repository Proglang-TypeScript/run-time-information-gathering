/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function FunctionContainer(functionId, name) {
        this.functionId = functionId;
        this.functionName = name;

        this.iid = null;
        this.isConstructor = null;
        this.isMethod = null;
        this.args = {};
        this.declarationEnclosingFunctionId = null;

        this.addArgumentContainer = function(argumentIndex, argumentContainer) {
            if (!(argumentIndex in this.args)) {
                this.args[argumentIndex] = argumentContainer;
            } else {
                this.args[argumentIndex].interactions = this.args[argumentIndex].interactions.concat(argumentContainer.interactions);
            }
        };

        this.getArgumentContainer = function(argumentIndex) {
            return this.args[argumentIndex];
        };
    }

    function ArgumentContainer(argumentIndex, name) {
        this.argumentIndex = argumentIndex;
        this.argumentName = name;

        this.shadowId = null;
        this.interactions = [];

        this.addInteraction = function(interaction) {
            this.interactions.push(interaction);
        };
    }

    sandbox.Constructors = {
        FunctionContainer: FunctionContainer,
        ArgumentContainer: ArgumentContainer
    };
}(J$));
