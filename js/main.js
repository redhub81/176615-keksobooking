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

  var subscribeMap = function () {
    modulesCache.map.onMainPinMove = function (point) {
      var address = getAddressByLocation(point);
      modulesCache.form.setAddress(address);
    };
  };

  var subscribeForm = function () {
    modulesCache.form.onAddressChanged = function (addressInfo) {
      modulesCache.map.parseMainPinPosition(addressInfo.newAddress);
      addressInfo.oldAddress = addressInfo.newAddress;
      addressInfo.newAddress = getAddressByLocation(modulesCache.map.getMainPinPosition());
    };
    modulesCache.form.onSubmit = function () {
      modulesCache.map.parseMainPinPosition(null);
      setupForm();
    };
  };

  var subscribeFilter = function () {
    window.listenFilters.onSelectedTypeKindChanged = function (newTypeKind) {
      window.filterAdverts.setTypeKind(newTypeKind);
      window.filterAdverts.updateAdverts();
    };
    window.listenFilters.onSelectedPriceRangeChanged = function (newPriceRange) {
      window.filterAdverts.setPriceRange(newPriceRange);
      window.filterAdverts.updateAdverts();
    };
    window.listenFilters.onSelectedRoomCountChanged = function (newRoomCount) {
      window.filterAdverts.setRoomCount(newRoomCount);
      window.filterAdverts.updateAdverts();
    };
    window.listenFilters.onSelectedGuestCountChanged = function (newGuestCount) {
      window.filterAdverts.setGuestCount(newGuestCount);
      window.filterAdverts.updateAdverts();
    };
    window.listenFilters.onFeaturesSelectionChanged = function (feature, status) {
      window.filterAdverts.setFeatureStatus(feature, status);
      window.filterAdverts.updateAdverts();
    };
  };

  /** Настройка модулей.
   ******************************************************************************/

  var setupForm = function () {
    var address = getAddressByLocation(modulesCache.map.getMainPinPosition());
    modulesCache.form.setAddress(address);
  };

  var setupFilter = function () {
    window.filterAdverts.setTypeKind(window.listenFilters.getSelectedTypeKind());
    window.filterAdverts.setPriceRange(window.listenFilters.getSelectedPriceRange());
    window.filterAdverts.setRoomCount(window.listenFilters.getSelectedRoomsCount());
    window.filterAdverts.setGuestCount(window.listenFilters.getSelectedGuestsCount());
    window.listenFilters.getSelectedFeatures().forEach(function (feature) {
      window.filterAdverts.setSelectedFeatures(feature, true);
    });
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Запускает выполнение модуля.
     */
    start: function () {
      if (init()) {
        setupForm();
        setupFilter();

        subscribeMap();
        subscribeForm();
        subscribeFilter();

        window.filterAdverts.onAdvertsFiltered = function (adverts) {
          var activeAdvertId = modulesCache.pin.getActiveAdvertId();
          var hasActiveAdvert = (activeAdvertId >= 0) && adverts.some(function (advert) {
            return advert.id === activeAdvertId;
          });
          if (adverts.length > 0 && !hasActiveAdvert) {
            activeAdvertId = adverts[0].id;
          }
          modulesCache.card.hide();
          modulesCache.pin.show(adverts);
          modulesCache.pin.activatePin(activeAdvertId);
        };
        modulesCache.data.onAdvertsLoaded = function () {
          window.filterAdverts.updateAdverts();
        };

        modulesCache.data.loadAdverts();
      }
    }
  };
  thisModule.start();
})();
