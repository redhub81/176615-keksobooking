// filter-adverts.js
'use strict';

window.filterAdverts = (function () {
  var thisModule;
  var typeKind;
  var priceMin;
  var priceMax;
  var roomsCount;
  var guestsCount;
  var selectedFeatures = [];

  /** Средства управления множеством доступных удобств.
   ******************************************************************************/

  var selectFeature = function (feature) {
    if (!~selectedFeatures.indexOf(feature)) {
      selectedFeatures.push(feature);
    }
  };

  var unselectFeature = function (feature) {
    var featureIndex = selectedFeatures.indexOf(feature);
    if (~featureIndex) {
      selectedFeatures.splice(featureIndex, 1);
    }
  };

  var isNoneFeaturesActive = function () {
    return selectedFeatures.length === 0;
  };

  var checkActiveFeaturesExistence = function (features) {
    return selectedFeatures.every(function (feature) {
      return ~features.indexOf(feature);
    });
  };

  /** Применение фильтра к набору доступных объявлений.
   ******************************************************************************/

  var updateAdverts = function () {
    var adverts = window.data.getAdverts()
      .filter(function (advert) {
        var isSatisfy = typeof typeKind === 'undefined' || typeKind === 'any'
          || advert.offer.type === typeKind;
        isSatisfy &= priceMin === null
          || priceMin <= advert.offer.price;
        isSatisfy &= priceMax === null
          || advert.offer.price < priceMax;
        isSatisfy &= typeof roomsCount === 'undefined' || roomsCount === null
          || advert.offer.rooms === roomsCount;
        isSatisfy &= typeof guestsCount === 'undefined' || guestsCount === null
          || advert.offer.guests === guestsCount;
        isSatisfy &= isNoneFeaturesActive()
          || checkActiveFeaturesExistence(advert.offer.features);
        return isSatisfy;
      });
    thisModule.onAdvertsFiltered(adverts);
  };


  var updateAdvertsWithDebounce = function () {
    window.debounce(updateAdverts);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Задает тип жилья.
     * @param {string} value Тип жилья.
     */
    setTypeKind: function (value) {
      typeKind = value;
    },
    /**
     * Задает диапазон стоимости проживания.
     * @param {Object} value Диапазон стоимости проживания.
     */
    setPriceRange: function (value) {
      priceMin = value.min;
      priceMax = value.max;
    },
    /**
     * Задает количество комнат.
     * @param {number} value Количество комнат.
     */
    setRoomCount: function (value) {
      roomsCount = value;
    },
    /**
     * Задает количетсво гостей.
     * @param {number} value Количество гостей.
     */
    setGuestCount: function (value) {
      guestsCount = value;
    },
    /**
     * Задает статус наличия удобства.
     * @param {string} feature Удобство.
     * @param {boolean} status Признак выбора удобства.
     */
    setFeatureStatus: function (feature, status) {
      var updateFeatureActivity = status
        ? selectFeature
        : unselectFeature;
      updateFeatureActivity(feature);
    },
    /**
     * Обновляет обявления в соответствии с заданными параметрами фильтра.
     */
    updateAdverts: function () {
      updateAdvertsWithDebounce();
    },
    /**
     * Вызывается после выполнения фтльтрации в соответствии с заданными параметрами фильтра.
     * @param {Object} adverts Отфильтрованные объявления.
     */
    onAdvertsFiltered: function (adverts) {}
  };
  return thisModule;
})();
