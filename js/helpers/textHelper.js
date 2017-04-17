// textHelper.js
'use strict';

window.textHelper = (function () {
  return {
    format: function (text, formats) {
      for (var index = 0; index < formats.length; index++) {
        text = text.replace('{' + index + '}', formats[index]);
      }
      return text;
    }
  };
})();
