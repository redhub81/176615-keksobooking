// pin.js
'use strict';

window.pin = (function () {
  var thisModule;
  var parent;
  var settings;
  var eventHelper;
  var data;

  var activePinElement = null;
  var elements = {};

  /** Вспомогательные методы.
   ******************************************************************************/

  var createPinId = function (advertId) {
    return 'pin-' + advertId;
  };

  var getAdvertId = function (pinId) {
    var lastItem = pinId.split('-').pop();
    return +lastItem;
  };

  /** Отрисовка метки на карте.
   ******************************************************************************/

  var createPinElement = function (advert) {
    var pinElement = document.createElement('div');
    pinElement.id = createPinId(advert.id);
    pinElement.classList.add('pin');
    var xPosition = advert.location.x - Math.round(0.5 * settings.PIN.WIDTH);
    var yPosition = advert.location.y - settings.PIN.HEIGHT;
    pinElement.style.left = xPosition + 'px';
    pinElement.style.top = yPosition + 'px';

    var childElement = document.createElement('img');
    childElement.src = advert.author.avatar;
    childElement.classList.add('rounded');
    childElement.width = settings.PIN.IMG.WIDTH;
    childElement.height = settings.PIN.IMG.HEIGHT;

    pinElement.appendChild(childElement);
    pinElement.tabIndex = '0';

    return pinElement;
  };

  var renderPin = function (adverts) {
    var pinElements = [];
    for (var index = 0; index < adverts.length; index++) {
      var pinElement = createPinElement(adverts[index]);
      pinElements.push(pinElement);
    }

    return pinElements;
  };

  var renderPinsFragment = function (adverts) {
    var pinsFragment = document.createDocumentFragment();
    var pins = renderPin(adverts);
    for (var index = 0; index < pins.length; index++) {
      pinsFragment.appendChild(pins[index]);
    }

    return pinsFragment;
  };

  /** Управление метками на карте.
   ******************************************************************************/

  function isActive(pin) {
    return activePinElement !== null && activePinElement.id === pin.id;
  }

  function activatePin(pin) {
    if (pin === null || isActive(pin)) {
      return;
    }

    deactivatePin(activePinElement);
    activePinElement = pin;
    pin.classList.add('pin--active');
    pin.focus();

    var advertId = getAdvertId(pin.id);
    thisModule.onActivatePin(advertId);
  }

  function deactivatePin(pin) {
    if (pin === null) {
      return;
    }

    var advertId = getAdvertId(pin.id);
    pin.classList.remove('pin--active');
    activePinElement = null;

    thisModule.onDeactivatePin(advertId);
  }

  var subscrube = function () {
    var pinKeydownHandler = null;
    var pins = elements.pinMapElement.querySelectorAll('.pin');

    for (var index = 0; index < pins.length; index++) {
      var pin = pins[index];

      pin.addEventListener('click', function (evt) {
        var pinTarget = evt.currentTarget;
        activatePin(pinTarget);
      });

      pin.addEventListener('focus', function (focusEvt) {
        pinKeydownHandler = function (keydownEvt) {
          if (eventHelper.isActivatedByKeyCode(keydownEvt, eventHelper.KEYS.ENTER)) {
            var pinTarget = keydownEvt.currentTarget;
            activatePin(pinTarget);
          }
        };
        focusEvt.currentTarget.addEventListener('keydown', pinKeydownHandler);
      });
      pin.addEventListener('blur', function (blurEvt) {
        blurEvt.currentTarget.removeEventListener('keydown', pinKeydownHandler);
        pinKeydownHandler = null;
      });
    }
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} allModules Предоставляет доступ ко всем модулям.
     * @param {Object} allElements Предоставляет дотуп к элементам.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, allModules, allElements) {
      parent = parentModule;
      settings = allModules.settings;
      eventHelper = allModules.eventHelper;
      data = allModules.data;

      elements = allElements;

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
     * Отображает метки объявлений на карте.
     */
    show: function () {
      var adverts = data.getAdverts();
      var pinFragment = renderPinsFragment(adverts);
      elements.pinMapElement.innerHTML = '';
      elements.pinMapElement.appendChild(pinFragment);
      subscrube();
    },
    /**
     * Активирует метку объявления на карте.
     * @param {int} advertId Идентификатор объявления.
     */
    activatePin: function (advertId) {
      if (advertId < 0) {
        return;
      }
      var pinId = createPinId(advertId);
      var pin = elements.pinMapElement.querySelector('#' + pinId);
      activatePin(pin);
    },
    /**
     * Вызывается после активации метки объявления на карте.
     * @param {int} advertId Идентификатор объявления.
     */
    onActivatePin: function (advertId) {},
    /**
     * Деактивирует метку объявления на карте.
     * @param {int} advertId Идентификатор объявления.
     */
    deactivatePin: function (advertId) {
      if (advertId < 0) {
        return;
      }
      var pinId = createPinId(advertId);
      var pin = elements.pinMapElement.querySelector('#' + pinId);
      deactivatePin(pin);
    },
    /**
     * Вызывается после деактивации метки объявления на карте.
     * @param {int} advertId Идентификатор объявления.
     */
    onDeactivatePin: function (advertId) {}
  };

  return thisModule;
})();
