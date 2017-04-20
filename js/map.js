// map.js
'use strict';

window.map = (function () {
  var MAIN_PIN_OFFSET;
  var PIN_PANEL_X_RANGE;
  var PIN_PANEL_Y_RANGE;

  var thisModule;
  var settings;
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
    var fixedPosition = Math.round(position);
    return range.min <= fixedPosition && fixedPosition <= range.max;
  };

  var coerceToRange = function (position, range) {
    return Math.min(Math.max(position, range.min), range.max);
  };

  var coerceToRectangle = function (point) {
    return {
      x: coerceToRange(point.x, PIN_PANEL_X_RANGE),
      y: coerceToRange(point.y, PIN_PANEL_Y_RANGE)
    };
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
      x: originPoint.x - MAIN_PIN_OFFSET.x,
      y: originPoint.y - MAIN_PIN_OFFSET.y
    };
  };

  var getMainPinOriginPoint = function (targetPoint) {
    return {
      x: targetPoint.x + MAIN_PIN_OFFSET.x,
      y: targetPoint.y + MAIN_PIN_OFFSET.y
    };
  };

  var parsePoint = function (text) {
    var xMatch = text.match(settings.noticeForm.address.parseXPattern);
    var yMatch = text.match(settings.noticeForm.address.parseYPattern);
    return {
      x: xMatch !== null ? xMatch[1] : null,
      y: yMatch !== null ? yMatch[1] : null
    };
  };

  /** Перетаскивание метки текущего заполняемого объявления.
   ******************************************************************************/

  var doDragByOrigin = function (element, originOffset, rectangle) {
    var result;
    var xRange = {min: rectangle.x0, max: rectangle.x1};
    var yRange = {min: rectangle.y0, max: rectangle.y1};

    element.addEventListener('mousedown', function (mousedownEvt) {
      mousedownEvt.preventDefault();
      var startPoint = {x: mousedownEvt.clientX, y: mousedownEvt.clientY};

      var mouseMoveHandle = function (moveEvt) {
        moveEvt.preventDefault();
        var getPosition = function (shift, position, offset, range) {
          var repeat = false;
          do {
            var targetPosition = position - shift;
            var originPosition = targetPosition + offset;
            repeat = !repeat && !isInRange(originPosition, range);
            if (repeat) {
              shift = 0;
            }
          }
          while (repeat);
          return {shift: shift, target: targetPosition, origin: originPosition};
        };
        var xPosition = getPosition(startPoint.x - moveEvt.clientX, element.offsetLeft, originOffset.x, xRange);
        var yPosition = getPosition(startPoint.y - moveEvt.clientY, element.offsetTop, originOffset.y, yRange);

        startPoint = {x: moveEvt.clientX, y: moveEvt.clientY};
        if (xPosition.shift !== 0 || yPosition.shift !== 0) {
          moveElement(element, {x: xPosition.target, y: yPosition.target});
        }
        result.onDrag({x: xPosition.origin, y: yPosition.origin});
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
        MAIN_PIN_OFFSET = {x: Math.round(0.5 * settings.mainPin.width), y: settings.mainPin.height};
        var boundingBox = settings.map.pinPanel.boundingBox;
        PIN_PANEL_X_RANGE = {min: boundingBox.x0, max: boundingBox.x1};
        PIN_PANEL_Y_RANGE = {min: boundingBox.y0, max: boundingBox.y1};

        subscribe();
        var doDragByOriginResult = doDragByOrigin(elements.mainPinElement, MAIN_PIN_OFFSET, settings.map.pinPanel.boundingBox);
        doDragByOriginResult.onDrag = function (originPoint) {
          thisModule.onMainPinMove(originPoint);
        };
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
      if (text === null) {
        moveElement(elements.mainPinElement, {x: null, y: null});
        return;
      }
      var rawPoint = parsePoint(text);
      var parsedPoint = {x: parseInt(rawPoint.x, 10), y: parseInt(rawPoint.y, 10)};
      if (!isNaN(parsedPoint.x) && !isNaN(parsedPoint.y)) {
        var originPoint = coerceToRectangle(parsedPoint);
        var targetPoint = getMainPinTargetPoint(originPoint);
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
