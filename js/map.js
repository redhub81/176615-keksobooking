// map.js
'use strict';

window.map = (function () {
  var parent;
  var pin;
  var card;

  var elements = {};

  /** Инициализация элементов.
   ******************************************************************************/

  var initElements = function () {
    elements.advertDialogElement = document.querySelector('.dialog');
    elements.advertDialogCloseElement = elements.advertDialogElement.querySelector('.dialog__close');

    elements.lodgeTemplate = document.querySelector('#lodge-template').content;
    elements.advertDialogTitleImage = document.querySelector('.dialog__title img');

    elements.pinMapElement = document.querySelector('.tokyo__pin-map');

    var initResult = Array.prototype.every.call(elements, function (module) {
      return typeof elements !== 'undefined';
    });

    return initResult;
  };

  var subscribe = function () {
    pin.onActivatePin = function (advertId) {
      card.show(advertId);
    };
    card.onClose = function (advertId) {
      pin.deactivatePin(advertId);
    };
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
      pin = allModules.pin;
      card = allModules.card;

      var initResult = initElements();
      if (initResult) {
        initResult &= pin.init(this, allModules, elements);
        initResult &= card.init(this, allModules, elements);
      }
      if (initResult) {
        subscribe();
      }

      return initResult;
    },
    /**
     * Возвращает родительский модуль.
     * @return {Object} родительский модуль.
     */
    getParent: function () {
      return parent;
    },
  };
})();
