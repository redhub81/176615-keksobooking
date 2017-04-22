// main.js
'use strict';

window.main = (function () {
  var thisModule;
  var modulesCache;

  /** Инициализация модулей.
   ******************************************************************************/

  var initModules = function () {
    modulesCache = {
      settings: window.defaultSettings,
      eventHelper: window.eventHelper,
      textHelper: window.textHelper,
      data: window.data,
      card: window.card,
      form: window.form,
      map: window.map,
      pin: window.pin,
      showCard: window.showCard,
      synchronizeFields: window.synchronizeFields
    };

    for (var moduleKey in modulesCache) {
      if (typeof modulesCache[moduleKey] === 'undefined' || modulesCache[moduleKey] === null) {
        return false;
      }
    }
    return true;
  };

  var init = function () {
    var initResult = initModules();
    if (initResult) {
      initResult &= modulesCache.data.init(thisModule, modulesCache);
      initResult &= modulesCache.map.init(thisModule, modulesCache);
      initResult &= modulesCache.form.init(thisModule, modulesCache);
    }
    return initResult;
  };

  /** Подписка событий модулей.
   ******************************************************************************/

  var getAddressByLocation = function (point) {
    return modulesCache.textHelper.format(modulesCache.settings.noticeForm.address.format, [point.x, point.y]);
  };

  var subscribe = function () {
    modulesCache.map.onMainPinMove = function (point) {
      var address = getAddressByLocation(point);
      modulesCache.form.setAddress(address);
    };
    modulesCache.form.onAddressChanged = function (addressInfo) {
      modulesCache.map.parseMainPinPosition(addressInfo.newAddress);
      addressInfo.oldAddress = addressInfo.newAddress;
      addressInfo.newAddress = getAddressByLocation(modulesCache.map.getMainPinPosition());
    };

    modulesCache.form.onSubmit = function () {
      modulesCache.map.parseMainPinPosition(null);
      setup();
    };
  };

  /** Настройка модулей.
   ******************************************************************************/

  var setup = function () {
    var address = getAddressByLocation(modulesCache.map.getMainPinPosition());
    modulesCache.form.setAddress(address);
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

        modulesCache.data.onAdvertsLoaded = function (adverts) {
          var defaultAdvertId = adverts[0].id;
          modulesCache.pin.show();
          modulesCache.pin.activatePin(defaultAdvertId);
        };
        modulesCache.data.loadAdverts();

        setup();
      }
    }
  };
  thisModule.start();
})();
