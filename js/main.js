// main.js
'use strict';

window.main = (function () {

  /** Настройка модулей.
   ******************************************************************************/

  var setupForm = function () {
    var address = getAddressByLocation(window.map.getMainPinPosition());
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

  /** Подписка событий модулей.
   ******************************************************************************/

  var getAddressByLocation = function (point) {
    return window.textHelper.format(window.settings.noticeForm.address.format, [point.x, point.y]);
  };

  var subscribeMap = function () {
    window.map.onMainPinMove = function (point) {
      var address = getAddressByLocation(point);
      window.form.setAddress(address);
    };
  };

  var subscribeForm = function () {
    window.form.onAddressChanged = function (addressInfo) {
      window.map.parseMainPinPosition(addressInfo.newAddress);
      addressInfo.oldAddress = addressInfo.newAddress;
      addressInfo.newAddress = getAddressByLocation(window.map.getMainPinPosition());
    };
    window.form.onSubmit = function () {
      window.map.parseMainPinPosition('');
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
      var hasActiveAdvert = (activeAdvertId >= 0) && adverts.some(function (advert) {
        return advert.id === activeAdvertId;
      });
      if (adverts.length > 0 && !hasActiveAdvert) {
        activeAdvertId = adverts[0].id;
      }
      window.card.hide();
      window.pin.show(adverts);
      window.pin.activatePin(activeAdvertId);
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
