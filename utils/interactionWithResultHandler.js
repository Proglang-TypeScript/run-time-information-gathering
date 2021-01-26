/* global J$ */

'use strict';

(function (sandbox) {
  function InteractionWithResultHandler(interactionContainerFinder) {
    this.interactionContainerFinder = interactionContainerFinder;

    var dis = this;

    this.processInteractionWithResult = function (interaction, result, base) {
      dis.interactionContainerFinder.addMapping(interaction, result);

      const containerForAddingNewInteraction = dis.interactionContainerFinder.findInteraction(base);

      if (containerForAddingNewInteraction) {
        containerForAddingNewInteraction.addInteraction(interaction);
      }
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.interactionWithResultHandler = new InteractionWithResultHandler(
    sandbox.utils.interactionContainerFinder,
  );
})(J$);
