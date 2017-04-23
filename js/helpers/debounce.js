// debounce.js
'use strict';

window.debounce = (function () {
  var DEBOUNCE_IN_MILLISECONDS = 500;

  var lastTimeout;

  return function (func) {
    if (lastTimeout) {
      window.clearTimeout(lastTimeout);
    }
    lastTimeout = window.setTimeout(func, DEBOUNCE_IN_MILLISECONDS);
  };
})();
