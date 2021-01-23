/* global J$ */

'use strict';

(function (sandbox) {
  function RecursiveInteractionsHandler(interactionSerializer) {
    this.usedInteractions = {};
    this.mapRecursiveMainInteractions = new WeakMap();

    this.interactionSerializer = interactionSerializer;

    var dis = this;

    this.getMainInteractionForCurrentInteraction = function (interaction) {
      if (this.mapRecursiveMainInteractions.has(interaction)) {
        return this.mapRecursiveMainInteractions.get(interaction);
      }

      return interaction;
    };

    this.associateMainInteractionToCurrentInteraction = function (interaction, result) {
      if (this.interactionAlreadyUsed(interaction, result)) {
        var interactionKey = getInteractionKey(interaction, result);

        this.mapRecursiveMainInteractions.set(interaction, this.usedInteractions[interactionKey]);
      }
    };

    this.reportUsedInteraction = function (interaction, result) {
      var interactionKey = getInteractionKey(interaction, result);

      this.usedInteractions[interactionKey] = interaction;
    };

    this.interactionAlreadyUsed = function (interaction, result) {
      var interactionKey = getInteractionKey(interaction, result);

      return interactionKey in this.usedInteractions;
    };

    function getInteractionKey(interaction, obj) {
      return dis.interactionSerializer.serialize(interaction, obj);
    }
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.recursiveInteractionsHandler = new RecursiveInteractionsHandler(
    sandbox.utils.interactionSerializer,
  );
})(J$);
