// map.js
'use strict';

window.map = (function () {
  var MAIN_PIN_RECTANGLE = {x0: 300, x1: 900, y0: 175, y1: 500};

  var thisModule;
  var settings;
  var parent;
  var pin;
  var card;
  var xRegExp;
  var yRegExp;

  var elements = {};

  /** Инициализация элементов.
   ******************************************************************************/

  var initElements = function () {
    elements.advertDialogElement = document.querySelector('.dialog');
    elements.advertDialogCloseElement = elements.advertDialogElement.querySelector('.dialog__close');

    elements.lodgeTemplate = document.querySelector('#lodge-template').content;
    elements.advertDialogTitleImage = elements.advertDialogElement.querySelector('.dialog__title img');

    elements.pinMapElement = document.querySelector('.tokyo__pin-map');

    var initResult = Array.prototype.every.call(elements, function (module) {
      return typeof elements !== 'undefined';
    });

    elements.mainPinElement = elements.pinMapElement.querySelector('.pin__main');

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

  var isInRange = function (position, range) {
    var fixedPosition = position.toFixed(0);
    return range.min <= fixedPosition && fixedPosition <= range.max;
  };

  var isInRectangle = function (point, rectangle) {
    return isInRange(point.x, {min: rectangle.x0, max: rectangle.x1})
      && isInRange(point.y, {min: rectangle.y0, max: rectangle.y1});
  };

  var getElementPoint = function (element) {
    return {
      x: element.offsetLeft,
      y: element.offsetTop
    };
  };

  var moveElement = function (element, point) {
    var changePosition = function (oldPosition, newPosition, callBackHandler) {
      if (newPosition !== oldPosition) {
        callBackHandler(newPosition !== null ? newPosition + 'px' : null);
      }
    };
    var currentPoint = getElementPoint(element);
    changePosition(currentPoint.x, point.x, function (targetPosition) {
      element.style.left = targetPosition;
    });
    changePosition(currentPoint.y, point.y, function (targetPosition) {
      element.style.top = targetPosition;
    });
  };

  var getMainPinTargetPoint = function (originPoint) {
    return {
      x: originPoint.x - 0.5 * settings.MAIN_PIN.WIDTH,
      y: originPoint.y - settings.MAIN_PIN.HEIGHT
    };
  };

  var getMainPinOriginPoint = function (targetPoint) {
    return {
      x: targetPoint.x + 0.5 * settings.MAIN_PIN.WIDTH,
      y: targetPoint.y + settings.MAIN_PIN.HEIGHT
    };
  };

  var parsePoint = function (text) {
    var xMatch = text.match(xRegExp);
    var yMatch = text.match(yRegExp);
    return {
      x: xMatch !== null ? xMatch[1] : null,
      y: yMatch !== null ? yMatch[1] : null,
    };
  };

  /** Перетаскивание метки текущего заполняемого объявления.
   ******************************************************************************/

  var doDragByOrigin = function (element, originOffset, rectangle) {
    var result;
    var rangeX = {min: rectangle.x0, max: rectangle.x1};
    var rangeY = {min: rectangle.y0, max: rectangle.y1};

    element.addEventListener('mousedown', function (mousedownEvt) {
      mousedownEvt.preventDefault();

      var startPoint = {
        x: mousedownEvt.clientX,
        y: mousedownEvt.clientY
      };

      var mouseMoveHandle = function (moveEvt) {
        moveEvt.preventDefault();
        var repeat;

        var shiftX = startPoint.x - moveEvt.clientX;
        repeat = false;
        do {
          var targetX = element.offsetLeft - shiftX;
          var originX = targetX + originOffset.x;
          repeat = !repeat && !isInRange(originX, rangeX);
          if (repeat) {
            shiftX = 0;
          }
        }
        while (repeat);

        var shiftY = startPoint.y - moveEvt.clientY;
        repeat = false;
        do {
          var targetY = element.offsetTop - shiftY;
          var originY = targetY + originOffset.y;
          repeat = !repeat && !isInRange(originY, rangeY);
          if (repeat) {
            shiftY = 0;
          }
        }
        while (repeat);

        startPoint = {
          x: moveEvt.clientX,
          y: moveEvt.clientY
        };

        if (shiftX !== 0 || shiftY !== 0) {
          moveElement(element, {x: targetX, y: targetY});
        }
        result.onDrag({x: originX, y: originY});
      };

      var mouseUpHandle = function (upEvt) {
        upEvt.preventDefault();

        document.removeEventListener('mousemove', mouseMoveHandle);
        document.removeEventListener('mouseup', mouseUpHandle);
      };

      document.addEventListener('mousemove', mouseMoveHandle);
      document.addEventListener('mouseup', mouseUpHandle);
    });

    result = {
      onDrag: function (originPoint) {}
    };
    return result;
  };


  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} allModules Предоставляет доступ ко всем модулям.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, allModules) {
      parent = parentModule;
      settings = allModules.settings;
      pin = allModules.pin;
      card = allModules.card;

      var initResult = initElements();
      if (initResult) {
        initResult &= pin.init(this, allModules, elements);
        initResult &= card.init(this, allModules, elements);
      }
      if (initResult) {
        subscribe();

        var mainPinOffset = {x: 0.5 * settings.MAIN_PIN.WIDTH, y: settings.MAIN_PIN.HEIGHT};
        var doDragByOriginResult = doDragByOrigin(elements.mainPinElement, mainPinOffset, MAIN_PIN_RECTANGLE);
        doDragByOriginResult.onDrag = function (originPoint) {
          thisModule.onMainPinMove(originPoint);
        };
        xRegExp = new RegExp(settings.NOTICE_FORM.ADDRESS.PARSE_X_PATTERN);
        yRegExp = new RegExp(settings.NOTICE_FORM.ADDRESS.PARSE_Y_PATTERN);
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
    /**
     * Возвращает позицию метки текущего заполняемого объявления.
     * @return {Object} Точка, соответствующая позиции метки.
     */
    getMainPinPosition: function () {
      var mainPinPoint = getElementPoint(elements.mainPinElement);
      return getMainPinOriginPoint(mainPinPoint);
    },
    /**
     * Устанавливает позицию метки текущего заполняемого объявления.
     * @param {string} text Текстовое представление позиции метки.
     */
    parseMainPinPosition: function (text) {
      var x;
      var y;
      var originPoint;
      var targetPoint;
      if (text === null) {
        moveElement(elements.mainPinElement, {x: null, y: null});
        return;
      }
      var rawPoint = parsePoint(text);
      if ((!isNaN(x = parseInt(rawPoint.x, 10))) && (!isNaN(y = parseInt(rawPoint.y, 10)))
        && isInRectangle(originPoint = {x: x, y: y}, MAIN_PIN_RECTANGLE)) {
        targetPoint = getMainPinTargetPoint(originPoint);
        moveElement(elements.mainPinElement, targetPoint);
      }
    },
    /**
     * Вызывается при изменении позиции метки текущего заполняемого объявления.
     * @param {Object} originPoint Точка, соответствующая позиции метки.
     */
    onMainPinMove: function (originPoint) {}
  };
  return thisModule;
})();
