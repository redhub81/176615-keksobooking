// pin.js
'use strict';

window.pin = (function () {
  var OTHER_PIN = window.settings.advertMap.otherPin;

  var thisModule;
  var activePinElement = null;

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var pinMapElement = document.querySelector('.tokyo__pin-map');
  var mainPinElement = pinMapElement.querySelector('.pin__main');

  /** Преобразование идентификаторов.
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
    var xPosition = advert.location.x - Math.round(0.5 * OTHER_PIN.width);
    var yPosition = advert.location.y - OTHER_PIN.height;
    pinElement.style.left = xPosition + 'px';
    pinElement.style.top = yPosition + 'px';

    var childElement = document.createElement('img');
    childElement.src = advert.author.avatar;
    childElement.classList.add('rounded');
    childElement.width = OTHER_PIN.img.width;
    childElement.height = OTHER_PIN.img.height;

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

  var isPinElement = function (element) {
    return typeof element.classList !== 'undefined'
      && element.classList.contains('pin') && !element.classList.contains('pin__main');
  };

  var clearPins = function () {
    var elements = pinMapElement.children;
    var pins = Array.prototype.filter.call(elements, isPinElement);

    activePinElement = null;
    pins.forEach(function (pin) {
      pinMapElement.removeChild(pin);
    });
  };

  var isActive = function (pin) {
    return activePinElement !== null && activePinElement.id === pin.id;
  };

  var activatePin = function (pin) {
    if (pin === null || isActive(pin)) {
      return;
    }
    deactivatePin(activePinElement);
    pin.classList.add('pin--active');
    activePinElement = pin;
    pin.focus();

    var advertId = getAdvertId(pin.id);
    thisModule.onActivatePin(advertId);
  };

  var deactivatePin = function (pin) {
    if (pin === null) {
      return;
    }
    pin.classList.remove('pin--active');
    activePinElement = null;

    var advertId = getAdvertId(pin.id);
    thisModule.onDeactivatePin(advertId);
  };

  /** Подписка на события.
   ******************************************************************************/

  var pinKeydownHandler = null;

  var getPinElement = function (targetElement) {
    while (targetElement !== null) {
      if (isPinElement(targetElement)) {
        break;
      }
      targetElement = targetElement.parentElement;
    }
    return targetElement;
  };

  pinMapElement.addEventListener('click', function (clickEvt) {
    var pinTarget = getPinElement(clickEvt.target);
    if (pinTarget !== null) {
      activatePin(pinTarget);
    }
  });

  pinMapElement.addEventListener('focus', function (focusEvt) {
    var pinTarget = getPinElement(focusEvt.target);
    if (pinTarget !== null && pinKeydownHandler === null) {
      pinKeydownHandler = function (keydownEvt) {
        if (window.eventHelper.isActivatedByKeyCode(keydownEvt, window.eventHelper.keys.enter)) {
          activatePin(keydownEvt.currentTarget);
        }
      };
      pinTarget.addEventListener('keydown', pinKeydownHandler);
    }
  }, true);

  pinMapElement.addEventListener('blur', function (blurEvt) {
    var pinTarget = getPinElement(blurEvt.target);
    if (pinTarget !== null && pinKeydownHandler !== null) {
      pinTarget.removeEventListener('keydown', pinKeydownHandler);
      pinKeydownHandler = null;
    }
  }, true);

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Отображает метки объявлений на карте.
     * @param {Array.<Object>} adverts Данные объявлений.
     */
    show: function (adverts) {
      clearPins();
      var pinFragment = renderPinsFragment(adverts);
      pinMapElement.insertBefore(pinFragment, mainPinElement);
    },
    /**
     * Возвращает идентификатор активного объявления.
     * @return {number} Идентификатор активного объявления.
     */
    getActiveAdvertId: function () {
      return activePinElement !== null
        ? getAdvertId(activePinElement.id)
        : -1;
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
      var pin = pinMapElement.querySelector('#' + pinId);
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
      var pin = pinMapElement.querySelector('#' + pinId);
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
