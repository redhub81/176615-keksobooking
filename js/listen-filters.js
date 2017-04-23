// filter.js
'use strict';

window.listenFilters = (function () {
  var thisModule;
  var filtersFormElement = document.querySelector('.tokyo__filters');
  var housingTypeSelectElement = filtersFormElement.querySelector('#housing_type');
  var housingPriceSelectElement = filtersFormElement.querySelector('#housing_price');
  var housingRoomNumberSelectElement = filtersFormElement.querySelector('#housing_room-number');
  var housingGuestsNumberSelectElement = filtersFormElement.querySelector('#housing_guests-number');
  var housingFeaturesFieldsetElement = filtersFormElement.querySelector('#housing_features');

  var getItemsCount = function (countCode) {
    var count = parseInt(countCode, 10);
    return !isNaN(count) ? count : null;
  };

  var getPriceRange = function (priceRangeCode) {
    var priceRange = {};
    switch (priceRangeCode) {
      case 'low':
        priceRange.min = null;
        priceRange.max = 10000;
        break;
      case 'middle':
        priceRange.min = 10000;
        priceRange.max = 50000;
        break;
      case 'high':
        priceRange.min = 50000;
        priceRange.max = null;
        break;
      default:
        priceRange.min = null;
        priceRange.max = null;
    }
    return priceRange;
  };

  housingTypeSelectElement.addEventListener('change', function (changeEvt) {
    thisModule.onSelectedTypeKindChanged(changeEvt.target.value);
  });

  housingPriceSelectElement.addEventListener('change', function (changeEvt) {
    var priceRange = getPriceRange(changeEvt.target.value);
    thisModule.onSelectedPriceRangeChanged(priceRange);
  });

  housingRoomNumberSelectElement.addEventListener('change', function (changeEvt) {
    thisModule.onSelectedRoomCountChanged(getItemsCount(changeEvt.target.value));
  });

  housingGuestsNumberSelectElement.addEventListener('change', function (changeEvt) {
    thisModule.onSelectedGuestCountChanged(getItemsCount(changeEvt.target.value));
  });

  housingFeaturesFieldsetElement.addEventListener('change', function (changeEvt) {
    var checkboxElement = changeEvt.target;
    if (checkboxElement !== null) {
      thisModule.onFeaturesSelectionChanged(checkboxElement.value, checkboxElement.checked);
    }
  });

  thisModule = {
    /**
     * Возвращает выбранный тип жилья.
     * @return {string} Тип жилья.
     */
    getSelectedTypeKind: function () {
      return housingTypeSelectElement.value;
    },
    /**
     * Возвращает выбранный диапазон стоимости проживания.
     * @return {Object} Диапазон стоимости проживания.
     */
    getSelectedPriceRange: function () {
      return getPriceRange(housingPriceSelectElement.value);
    },
    /**
     * Возвращает выбранное количество комнат.
     * @return {number} Количество комнат.
     */
    getSelectedRoomsCount: function () {
      return getItemsCount(housingRoomNumberSelectElement.value);
    },
    /**
     * Возвращает выбранное количество гостей.
     * @return {number} Количество гостей.
     */
    getSelectedGuestsCount: function () {
      return getItemsCount(housingGuestsNumberSelectElement.value);
    },
    /**
     * Возвращает возвращает выбранные удобства.
     * @return {Array.<Object>} Выбранные удобства.
     */
    getSelectedFeatures: function () {
      var featureInputs = housingFeaturesFieldsetElement.querySelectorAll('.feature input[type="checkbox"]');
      return Array.prototype.filter.call(featureInputs, function (it) {
        return it.checked;
      });
    },
    /**
     * Вызывается при изменении выбранного типа жилья.
     * @param {string} newTypeKind Новый тип жилья.
     */
    onSelectedTypeKindChanged: function (newTypeKind) {},
    /**
     * Вызывается при изменении выбранного диапазона стоимости проживания.
     * @param {Object} newPriceRange Новый диапазон стоимости проживания.
     */
    onSelectedPriceRangeChanged: function (newPriceRange) {},
    /**
     * Вызывается при изменении выьранного количества комнат.
     * @param {number} newRoomCount Новое количество комнат.
     */
    onSelectedRoomCountChanged: function (newRoomCount) {},
    /**
     * Вызывается при изменении выбранного количества гостей.
     * @param {number} newGuestCount Новое количество гостей.
     */
    onSelectedGuestCountChanged: function (newGuestCount) {},
    /**
     * Вызывается при изменении статуса наличия удобства.
     * @param {string} feature Удобство.
     * @param {boolean} status Статус выбора наличия удобства.
     */
    onFeaturesSelectionChanged: function (feature, status) {}
  };
  return thisModule;
})();
