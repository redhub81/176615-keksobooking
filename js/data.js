// data.js
'use strict';

window.data = (function (modules) {
  var NUMBER_ID_LENGTH = 2;
  var NUMBER_ID_MIN = 0;
  var NUMBER_ID_MAX = 100;

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

  var createNumberId = function (number) {
    var numberAsString = number.toString();
    var leadZeroCount = NUMBER_ID_LENGTH - numberAsString.length;
    var prefix = leadZeroCount > 0
      ? (new Array(leadZeroCount + 1)).join('0')
      : '';
    return prefix + numberAsString;
  };

  /** Создание моделей вида.
   ******************************************************************************/

  var getOfferTitle = function (number, substitution) {
    return settings.advert.offer.titles[substitution[number]];
  };

  var createLocation = function () {
    var BOUNDING_BOX = settings.map.pinPanel.boundingBox;
    return {
      x: getRandomInt(BOUNDING_BOX.x0, BOUNDING_BOX.x1),
      y: getRandomInt(BOUNDING_BOX.y0, BOUNDING_BOX.y1)
    };
  };

  var createAuthor = function (id) {
    var result;
    if (id && id >= NUMBER_ID_MIN && id < NUMBER_ID_MAX) {
      result = {
        avatar: textHelper.format(settings.advert.author.avatar.formats.url, [createNumberId(id)])
      };
    }
    return result;
  };

  var createOffer = function (title, location) {
    return {
      title: title,
      address: textHelper.format(settings.advert.offer.formats.address, [location.x, location.y]),
      price: getRandomInt(settings.advert.offer.price.min, settings.advert.offer.price.max),
      type: getRandomItem(settings.advert.offer.type.kinds),
      rooms: getRandomInt(settings.advert.offer.room.count.min, settings.advert.offer.room.count.max),
      guests: getRandomInt(settings.advert.offer.guest.count.min, settings.advert.offer.guest.count.max),
      checkin: getRandomItem(settings.advert.offer.checkTime),
      checkout: getRandomItem(settings.advert.offer.checkTime),
      features: getRandomItemsWithoutRepetition(settings.advert.offer.features, getRandomInt(0, settings.advert.offer.features.length)),
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

    var advertCount = settings.advert.offer.titles.length;
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
      return advertItems.find(function (element) {
        return element.id === advertId;
      });
    }
  };
})();
