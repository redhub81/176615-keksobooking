// synchronize-fields.js
'use strict';

window.synchronizeFields = (function () {

  var setTargetValue = function (newValue, targetElement, sourceKeyValues, targetKeyValues, setTargetValueCallback) {
    var sourceKeys = Object.keys(sourceKeyValues);
    var sourceKey = sourceKeys.find(function (key) {
      return sourceKeyValues[key] === newValue;
    });
    if (typeof sourceKey !== 'undefined') {
      setTargetValueCallback(targetElement, targetKeyValues[sourceKey]);
    }
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return function (sourceSelectElement, targetElement, sourceKeyValues, targetKeyValues, setTargetValueCallback) {
    sourceSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = changeEvt.target.value;
      setTargetValue(newValue, targetElement, sourceKeyValues, targetKeyValues, setTargetValueCallback);
    });

    return function () {
      setTargetValue(sourceSelectElement.value, targetElement, sourceKeyValues, targetKeyValues, setTargetValueCallback);
    };
  };
})();
