// data.js
'use strict';

window.data = (function (modules) {
  var parent;
  var settings;
  var textHelper;

  var advertItems = [];

  /** Вспомогательные методы.
   ******************************************************************************/

  var getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var getRandomItem = function (array) {
    return array[getRandomInt(0, array.length - 1)];
  };

  var getRandomSubstitutionWithoutRepetition = function (fromCount, toCount) {
    var substitution = [];
    var valueDictionary = {};
    for (var index = 0; index < toCount; index++) {
      do {
        var value = getRandomInt(0, fromCount - 1);
        var valueAsString = '' + value;
      } while (valueAsString in valueDictionary);
      valueDictionary[valueAsString] = value;
      substitution[index] = value;
    }
    return substitution;
  };

  var getRandomItemsWithoutRepetition = function (sourceItems, count) {
    var result;
    if (sourceItems.length >= count) {
      var substitution = getRandomSubstitutionWithoutRepetition(sourceItems.length, count);
      var orderedSubstitution = substitution.sort();

      var items = [];
      for (var index = 0; index < orderedSubstitution.length; index++) {
        items.push(sourceItems[orderedSubstitution[index]]);
      }
      result = items;
    }
    return result;
  };

  var createNumberId = function (number, length) {
    var numberAsString = number.toString();
    var leadZeroCount = length - numberAsString.length;
    var prefix = leadZeroCount > 0
      ? Array(leadZeroCount + 1).join('0')
      : '';
    return prefix + numberAsString;
  };

  /** Создание моделей вида.
   ******************************************************************************/

  var getOfferTitle = function (number, substitution) {
    return settings.ADVERT.OFFER.TITLES[substitution[number]];
  };

  var createLocation = function () {
    return {
      x: getRandomInt(300, 900),
      y: getRandomInt(100 + settings.PIN.HEIGHT, 500)
    };
  };

  var createAuthor = function (id) {
    var result;
    if (id && id >= 0 && id < 100) {
      result = {
        avatar: textHelper.format(settings.ADVERT.AUTHOR.AVATAR.FORMATS.URL, [createNumberId(id, 2)])
      };
    }
    return result;
  };

  var createOffer = function (title, location) {
    return {
      title: title,
      address: textHelper.format(settings.ADVERT.OFFER.FORMATS.ADDRESS, [location.x, location.y]),
      price: getRandomInt(1000, 1000000),
      type: getRandomItem(settings.ADVERT.OFFER.TYPE.KINDS),
      rooms: getRandomInt(1, 5),
      guests: getRandomInt(1, 10),
      checkin: getRandomItem(settings.ADVERT.OFFER.CHECK_TIME),
      checkout: getRandomItem(settings.ADVERT.OFFER.CHECK_TIME),
      features: getRandomItemsWithoutRepetition(settings.ADVERT.OFFER.FEATURES, getRandomInt(0, settings.ADVERT.OFFER.FEATURES.length)),
      description: '',
      photos: []
    };
  };

  var createAdvert = function (id, title) {
    var location = createLocation();
    return {
      id: id,
      author: createAuthor(id),
      offer: createOffer(title, location),
      location: location
    };
  };

  var createAdverts = function () {
    var adverts = [];

    var advertCount = settings.ADVERT.OFFER.TITLES.length;
    var titleSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);
    var numberSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);

    for (var number = 0; number < advertCount; number++) {
      var title = getOfferTitle(number, titleSubstitution);
      var id = 1 + numberSubstitution[number];

      var advert = createAdvert(id, title);
      adverts.push(advert);
    }

    return adverts;
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} allModules Предоставляет доступ ко всем модулям.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, allModules) {
      parent = parentModule;
      settings = allModules.settings;
      textHelper = allModules.textHelper;

      return true;
    },
    /**
     * Возвращает родительский модуль.
     * @return {Object} родительский модуль.
     */
    getParent: function () {
      return parent;
    },
    /**
     * Загружает данные объявлений.
     */
    loadAdverts: function () {
      advertItems = createAdverts();
    },
    /**
     * Возвращает данные загруженных объявлений.
     * @return {Array} Данные загруженных объявлений.
     */
    getAdverts: function () {
      return advertItems;
    },
    /**
     * Возвращает данные объявления по его идентификатору.
     * @param {int} advertId Идентификатор объявления.
     * @return {Object} Данные объявления.
     */
    getAdvertById: function (advertId) {
      var advertItem = advertItems.find(function (element) {
        return element.id === advertId;
      });
      return advertItem;
    }
  };
})();
