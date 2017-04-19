// main.js
'use strict';

window.main = (function () {
  var thisModule;
  var modules = {};

  /** Инициализация модулей.
   ******************************************************************************/

  var initModules = function () {
    modules.settings = window.defaultSettings;
    modules.eventHelper = window.eventHelper;
    modules.textHelper = window.textHelper;
    modules.data = window.data;
    modules.card = window.card;
    modules.form = window.form;
    modules.map = window.map;
    modules.pin = window.pin;

    return Array.prototype.every.call(modules, function (module) {
      return typeof module !== 'undefined';
    });
  };

  var init = function () {
    var initResult = initModules();
    if (initResult) {
      initResult &= modules.data.init(thisModule, modules);
      initResult &= modules.map.init(thisModule, modules);
      initResult &= modules.form.init(thisModule);
    }

    return initResult;
  };

  /** Подписка событий модулей.
   ******************************************************************************/

  var getAddressByLocation = function (point) {
    return modules.textHelper.format(modules.settings.noticeForm.address.format, [point.x, point.y]);
  };

  var subscribe = function () {
    modules.map.onMainPinMove = function (point) {
      var address = getAddressByLocation(point);
      modules.form.setAddress(address);
    };
    modules.form.onAddressChanged = function (addressInfo) {
      modules.map.parseMainPinPosition(addressInfo.newAddress);
      addressInfo.oldAddress = addressInfo.newAddress;
      addressInfo.newAddress = getAddressByLocation(modules.map.getMainPinPosition());
    };

    modules.form.onSubmit = function () {
      modules.map.parseMainPinPosition(null);
      setup();
    };
  };

  /** Настройка модулей.
   ******************************************************************************/

  var setup = function () {
    var address = getAddressByLocation(modules.map.getMainPinPosition());
    modules.form.setAddress(address);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Запускает выполнение модуля.
     */
    start: function () {
      if (init()) {
        subscribe();

        modules.data.loadAdverts();
        var defaultAdvertId = modules.data.getAdverts()[0].id;
        modules.pin.show();
        modules.pin.activatePin(defaultAdvertId);

        setup();
      }
    }
  };
  thisModule.start();
})();
