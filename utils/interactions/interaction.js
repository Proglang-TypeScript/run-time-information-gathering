/* global J$ */

'use strict';

const { nanoid } = require('nanoid');

(function (sandbox) {
  function Interaction() {
    this.code = null;
    this.traceId = null;
    this.interactionId = nanoid();
  }

  if (sandbox.utils === undefined) {
    sandbox.utils = {};
  }

  sandbox.utils.Interaction = Interaction;
})(J$);
