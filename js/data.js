// data.js
'use strict';

window.data = (function (modules) {
  var KEKSOBOOKING_DATA_URL = 'https://intensive-javascript-server-kjgvxfepjl.now.sh/keksobooking/data';
  var NUMBER_ID_LENGTH = 2;
  var NUMBER_ID_MIN = 0;
  var NUMBER_ID_MAX = 100;
  var OFFER_SETTINGS;

  var thisModule;
  var modulesCache;
  var advertItems;

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
    return OFFER_SETTINGS.titles[substitution[number]];
  };

  var createLocation = function () {
    var BOUNDING_BOX = modulesCache.settings.map.pinPanel.boundingBox;
    return {
      x: getRandomInt(BOUNDING_BOX.x0, BOUNDING_BOX.x1),
      y: getRandomInt(BOUNDING_BOX.y0, BOUNDING_BOX.y1)
    };
  };

  var createAuthor = function (id) {
    var result;
    if (id && id >= NUMBER_ID_MIN && id < NUMBER_ID_MAX) {
      result = {
        avatar: modulesCache.textHelper.format(modulesCache.settings.advert.author.avatar.formats.url, [createNumberId(id)])
      };
    }
    return result;
  };

  var createOffer = function (title, location) {

    return {
      title: title,
      address: modulesCache.textHelper.format(OFFER_SETTINGS.formats.address, [location.x, location.y]),
      price: getRandomInt(OFFER_SETTINGS.price.min, OFFER_SETTINGS.price.max),
      type: getRandomItem(OFFER_SETTINGS.type.kinds),
      rooms: getRandomInt(OFFER_SETTINGS.room.count.min, OFFER_SETTINGS.room.count.max),
      guests: getRandomInt(OFFER_SETTINGS.guest.count.min, OFFER_SETTINGS.guest.count.max),
      checkin: getRandomItem(OFFER_SETTINGS.checkTime),
      checkout: getRandomItem(OFFER_SETTINGS.checkTime),
      features: getRandomItemsWithoutRepetition(OFFER_SETTINGS.features, getRandomInt(0, OFFER_SETTINGS.features.length)),
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

  var generateAdverts = function () {
    var adverts = [];
    var advertCount = OFFER_SETTINGS.titles.length;
    var titleSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);
    var numberSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);

    for (var number = 0; number < advertCount; number++) {
      var title = getOfferTitle(number, titleSubstitution);
      var id = 1 + numberSubstitution[number];

      var advert = createAdvert(id, title);
      adverts.push(advert);
    }
    advertItems = adverts;
    thisModule.onAdvertsLoaded(adverts);
  };

  var loadArverts = function () {
    window.load(KEKSOBOOKING_DATA_URL, function (adverts) {
      adverts.forEach(function (advert, index) {
        advert.id = index;
      });
      advertItems = adverts;
      thisModule.onAdvertsLoaded(adverts);
    }, function (errorMessage) {
      window.showError(errorMessage);
    });
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} parentModulesCache Предоставляет доступ ко всем модулям.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, parentModulesCache) {
      modulesCache = {
        parent: parentModule,
        settings: parentModulesCache.settings,
        textHelper: parentModulesCache.textHelper
      };
      OFFER_SETTINGS = modulesCache.settings.advert.offer;
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
     * Генерирует данные объявлений.
     */
    generateAdverts: generateAdverts,
    /**
     * Загружает данные объявлений.
     */
    loadAdverts: loadArverts,
    /**
     * Вызывается после загрузки объявлений.
     * @param {Array.<Object>} arverts Данные загруженных объявлений.
     */
    onAdvertsLoaded: function (arverts) {},
    /**
     * Возвращает данные загруженных объявлений.
     * @return {Array.<Object>} Данные загруженных объявлений.
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
  return thisModule;
})();
