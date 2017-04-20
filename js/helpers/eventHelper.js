// eventHelper.js
'use strict';

window.eventHelper = (function () {
  return {
    keys: {
      enter: 13,
      escape: 27
    },
    isActivatedByKeyCode: function (evt, keyCode) {
      return evt.keyCode && evt.keyCode === keyCode;
    }
  };
})();
