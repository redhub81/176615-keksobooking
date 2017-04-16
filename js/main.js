// main.js
'use strict';

window.main = (function () {
  var modules = {};

  var initModules = function () {
    modules.settings = window.defaultSettings;
    modules.eventHelper = window.eventHelper;
    modules.textHelper = window.textHelper;
    modules.data = window.data;
    modules.card = window.card;
    modules.form = window.form;
    modules.map = window.map;
    modules.pin = window.pin;

    var initResult = Array.prototype.every.call(modules, function (module) {
      return typeof module !== 'undefined';
    });

    return initResult;
  };

  var init = function (thisModule) {
    var initResult = initModules();
    if (initResult) {
      initResult &= modules.data.init(thisModule, modules);
      initResult &= modules.map.init(thisModule, modules);
      initResult &= modules.form.init(thisModule);
    }

    return initResult;
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return {
    /**
     * Запускает выполнение модуля.
     */
    start: function () {
      if (init(this)) {
        modules.data.loadAdverts();
        var defaultAdvertId = modules.data.getAdverts()[0].id;
        modules.pin.show();
        modules.pin.activatePin(defaultAdvertId);
      }
    }
  };
})();

window.main.start();
