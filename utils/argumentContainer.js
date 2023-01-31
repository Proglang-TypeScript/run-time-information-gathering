/* global J$ */

'use strict';

const { produceMessage } = require('./kafka');
const { nanoid } = require('nanoid');

(function (sandbox) {
  function ArgumentContainer(argumentIndex, name) {
    this.argumentIndex = argumentIndex;
    this.argumentName = name;
    this.argumentId = nanoid();

    this.interactions = [];

    this.addInteraction = function (interaction) {
      this.interactions.push(interaction);

      const message = {
        command: 'add-interaction',
        data: {
          argumentId: this.argumentId,
          interaction,
        },
      };
      
      produceMessage(message).catch((err) => console.log(err));
    };


  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.ArgumentContainer = ArgumentContainer;
})(J$);
