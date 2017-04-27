// data.js
'use strict';

window.data = (function () {
  var KEKSOBOOKING_DATA_URL = 'https://intensive-javascript-server-kjgvxfepjl.now.sh/keksobooking/data';

  var thisModule;
  var advertItems;

  /** Доступ к данным.
   ******************************************************************************/

  var loadHandler = function (adverts) {
    advertItems = adverts;
    advertItems.forEach(function (advert, index) {
      advert.id = index;
    });
    thisModule.onAdvertsLoaded(advertItems);
  };

  var errorHandler = function (errorMessage) {
    window.showError(errorMessage);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Загружает данные объявлений.
     */
    loadAdverts: function () {
      window.load(KEKSOBOOKING_DATA_URL, loadHandler, errorHandler);
    },
    /**
     * Вызывается после загрузки объявлений.
     * @param {Array.<Object>} adverts Данные загруженных объявлений.
     */
    onAdvertsLoaded: function (adverts) {},
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
