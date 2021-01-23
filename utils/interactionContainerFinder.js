/* global J$ */

'use strict';

(function (sandbox) {
  function InteractionContainerFinder(sMemoryInterface) {
    this.sMemoryInterface = sMemoryInterface;

    const map = new WeakMap();

    this.findInteraction = function (obj) {
      return map.get(obj);
    };

    this.addMapping = function (interaction, result) {
      if (!map.has(result)) {
        try {
          map.set(result, interaction);
        } catch (error) {
          // Do nothing if result is not an object
        }
      }
    };
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.interactionContainerFinder = new InteractionContainerFinder(
    sandbox.utils.sMemoryInterface,
  );
})(J$);
