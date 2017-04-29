// main.js
'use strict';

window.main = (function () {
  var ADDRESS_SETTINGS = window.settings.noticeForm.address;
  var UNKNOWN_LOCATION = window.settings.advertMap.unknownLocation;

  var isInitialized = false;

  /** Настройка модулей.
   ******************************************************************************/

  var setupForm = function () {
    var location = window.map.getMainPinLocation();
    var address = getAddressByLocation(location);
    window.form.setAddress(address);
  };

  var setupFilter = function () {
    window.filterAdverts.setTypeKind(window.listenFilters.getSelectedTypeKind());
    window.filterAdverts.setPriceRange(window.listenFilters.getSelectedPriceRange());
    window.filterAdverts.setRoomCount(window.listenFilters.getSelectedRoomsCount());
    window.filterAdverts.setGuestCount(window.listenFilters.getSelectedGuestsCount());
    window.listenFilters.getSelectedFeatures().forEach(function (feature) {
      window.filterAdverts.setFeatureStatus(feature, true);
    });
  };

  /** Преобразование данных.
   ******************************************************************************/

  var getAddressByLocation = function (location) {
    return window.textHelper.format(ADDRESS_SETTINGS.format, [location.x, location.y]);
  };

  var getLocationByaddress = function (address) {
    var xMatch = address.match(ADDRESS_SETTINGS.parseXPattern);
    var yMatch = address.match(ADDRESS_SETTINGS.parseYPattern);
    return {
      x: xMatch !== null ? xMatch[1] : null,
      y: yMatch !== null ? yMatch[1] : null
    };
  };

  /** Подписка событий модулей.
   ******************************************************************************/

  var subscribeMap = function () {
    window.map.onMainPinMove = function (location) {
      var address = getAddressByLocation(location);
      window.form.setAddress(address);
    };
  };

  var subscribeForm = function () {
    window.form.onAddressChanged = function (addressInfo) {
      var newAddress = addressInfo.newAddress;
      var location = newAddress !== null && newAddress !== ''
        ? getLocationByaddress(newAddress)
        : UNKNOWN_LOCATION;

      window.map.setMainPinLocation(location);

      addressInfo.oldAddress = addressInfo.newAddress;
      addressInfo.newAddress = getAddressByLocation(window.map.getMainPinLocation());
    };
    window.form.onSubmit = function () {
      window.map.setMainPinLocation(UNKNOWN_LOCATION);
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

    window.filterAdverts.onAdvertsFiltered = function (adverts) {
      var activeAdvertId = window.pin.getActiveAdvertId();
      if (!isInitialized && adverts.length > 0) {
        activeAdvertId = adverts[0].id;
        isInitialized = true;
      }
      var hasActiveAdvert = activeAdvertId >= 0 && adverts.some(function (advert) {
        return advert.id === activeAdvertId;
      });

      window.card.hide();
      window.pin.show(adverts);

      if (hasActiveAdvert) {
        window.pin.activatePin(activeAdvertId);
      }
    };
    window.data.onAdvertsLoaded = function () {
      window.filterAdverts.updateAdverts();
    };
  };

  /** Предваритлеьная настройка и запуск приложения.
   ******************************************************************************/

  setupForm();
  setupFilter();

  subscribeMap();
  subscribeForm();
  subscribeFilter();

  window.data.loadAdverts();
})();
