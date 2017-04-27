// map.js
'use strict';

window.map = (function () {
  var BOUNDING_BOX = window.settings.map.pinPanel.boundingBox;
  var PIN_PANEL_X_RANGE = {min: BOUNDING_BOX.x0, max: BOUNDING_BOX.x1};
  var PIN_PANEL_Y_RANGE = {min: BOUNDING_BOX.y0, max: BOUNDING_BOX.y1};
  var MAIN_PIN_OFFSET = {x: Math.round(0.5 * window.settings.mainPin.width), y: window.settings.mainPin.height};

  var thisModule;

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var pinMapElement = document.querySelector('.tokyo__pin-map');
  var mainPinElement = pinMapElement.querySelector('.pin__main');

  /** Расчет и преобразование координат.
   ******************************************************************************/

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
    var xMatch = text.match(window.settings.noticeForm.address.parseXPattern);
    var yMatch = text.match(window.settings.noticeForm.address.parseYPattern);
    return {
      x: xMatch !== null ? xMatch[1] : null,
      y: yMatch !== null ? yMatch[1] : null
    };
  };

  /** Перетаскивание метки заполняемого пользователем объявления.
   ******************************************************************************/

  var getElementPoint = function (element) {
    return {
      x: element.offsetLeft,
      y: element.offsetTop
    };
  };

  var moveElement = function (element, point) {
    var currentPoint = getElementPoint(element);
    var changePosition = function (oldPosition, newPosition, callBackHandler) {
      if (newPosition !== oldPosition) {
        callBackHandler(newPosition !== null ? newPosition + 'px' : null);
      }
    };
    changePosition(currentPoint.x, point.x, function (targetPosition) {
      element.style.left = targetPosition;
    });
    changePosition(currentPoint.y, point.y, function (targetPosition) {
      element.style.top = targetPosition;
    });
  };

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

  /** Подписка на события.
   ******************************************************************************/

  window.pin.onActivatePin = function (advertId) {
    var advert = window.data.getAdvertById(advertId);
    window.showCard(advert).onClose = function (closeAdvertId) {
      window.pin.deactivatePin(closeAdvertId);
    };
  };

  var doDragByOriginResult = doDragByOrigin(mainPinElement, MAIN_PIN_OFFSET, BOUNDING_BOX);
  doDragByOriginResult.onDrag = function (originPoint) {
    thisModule.onMainPinMove(originPoint);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Возвращает позицию метки текущего заполняемого объявления.
     * @return {Object} Точка, соответствующая позиции метки.
     */
    getMainPinPosition: function () {
      var mainPinPoint = getElementPoint(mainPinElement);
      return getMainPinOriginPoint(mainPinPoint);
    },
    /**
     * Устанавливает позицию метки текущего заполняемого объявления.
     * @param {string} text Текстовое представление позиции метки.
     */
    parseMainPinPosition: function (text) {
      if (text === null || text === '') {
        moveElement(mainPinElement, {x: null, y: null});
        return;
      }
      var rawPoint = parsePoint(text);
      var parsedPoint = {x: parseInt(rawPoint.x, 10), y: parseInt(rawPoint.y, 10)};
      if (!isNaN(parsedPoint.x) && !isNaN(parsedPoint.y)) {
        var originPoint = coerceToRectangle(parsedPoint);
        var targetPoint = getMainPinTargetPoint(originPoint);
        moveElement(mainPinElement, targetPoint);
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
