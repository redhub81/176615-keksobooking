// eventHelper.js
'use strict';

window.eventHelper = (function () {
  return {
    KEYS: {
      ENTER: 13,
      ESCAPE: 27
    },
    isActivatedByKeyCode: function (evt, keyCode) {
      return evt.keyCode && evt.keyCode === keyCode;
    }
  };
})();
