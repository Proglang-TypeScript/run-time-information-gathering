/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
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
        ArgumentContainer: ArgumentContainer
    };
}(J$));
