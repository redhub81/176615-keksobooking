// eventHelper.js
'use strict';

window.eventHelper = (function () {
  return {
    keys: {
      enter: 13,
      escape: 27
    },
    isActivatedByKeyCode: function (evt, keyCode) {
      return typeof evt.keyCode !== 'undefined' && evt.keyCode === keyCode;
    },
    findParent: function (target, callback) {
      while (target !== null) {
        if (callback(target)) {
          break;
        }
        target = target.parentElement;
      }
      return target;
    }
  };
})();
