// textHelper.js
'use strict';

window.textHelper = (function () {
  return {
    format: function (format, values) {
      for (var index = 0; index < values.length; index++) {
        format = format.replace('{' + index + '}', values[index]);
      }
      return format;
    }
  };
})();
