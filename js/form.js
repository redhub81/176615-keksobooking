// form.js
'use strict';

window.form = (function () {
  var PRICE_MAPPING = [0, 1000, 10000];

  var parent;

  var elements = {};
  var binding;

  /** Доступ к эелементам.
   ******************************************************************************/

  var initElements = function () {
    elements.noticeFormElement = document.querySelector('.notice__form');
    elements.timeSelectElement = document.getElementById('time');
    elements.timeoutSelectElement = document.getElementById('timeout');
    elements.lodgingTypeSelectElement = document.getElementById('type');
    elements.priceInputElement = document.getElementById('price');
    elements.roomsSelectElement = document.getElementById('room_number');
    elements.guestsSelectElement = document.getElementById('capacity');

    elements.pinMapElement = document.querySelector('.tokyo__pin-map');

    var initResult = Array.prototype.every.call(elements, function (module) {
      return typeof elements !== 'undefined';
    });

    return initResult;
  };

  /** Свзязывание полей формы.
   ******************************************************************************/

  var bindNoticeFormElements = function () {
    var setSelectedValue = function (targetSelect, value) {
      var targetValue = Array.prototype.find.call(targetSelect.options, function (option) {
        return option.value === value;
      });
      if (targetValue && !targetValue.selected) {
        targetSelect.value = targetValue.value;
      }
    };

    var setPriceInputValue = function (priceInput, value) {
      var minPrice = PRICE_MAPPING[value];
      priceInput.min = minPrice;
      priceInput.placeholder = minPrice;

      var currentPrice = parseInt(priceInput.value, 10);
      if (!isNaN(currentPrice) && currentPrice < minPrice) {
        priceInput.value = '';
      }
    };

    elements.timeSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = changeEvt.target.value;
      setSelectedValue(elements.timeoutSelectElement, newValue);
    });
    elements.timeoutSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = changeEvt.target.value;
      setSelectedValue(elements.timeSelectElement, newValue);
    });

    elements.lodgingTypeSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = +changeEvt.target.value;
      setPriceInputValue(elements.priceInputElement, newValue);
    });

    elements.roomsSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = changeEvt.target.value;
      setSelectedValue(elements.guestsSelectElement, newValue);
    });
    elements.guestsSelectElement.addEventListener('change', function (changeEvt) {
      var newValue = changeEvt.target.value;
      setSelectedValue(elements.roomsSelectElement, newValue);
    });

    return {
      updateTimeOut: function () {
        setSelectedValue(elements.timeoutSelectElement, elements.timeSelectElement.value);
      },
      updatePrice: function () {
        setPriceInputValue(elements.priceInputElement, elements.lodgingTypeSelectElement.value);
      },
      updateGuestsSelect: function () {
        setSelectedValue(elements.guestsSelectElement, elements.roomsSelectElement.value);
      }
    };
  };

  /** Валидация.
   ******************************************************************************/

  var initNoticeFormValidation = function (noticeForm) {
    var setErrorMerker = function (formElement) {
      formElement.classList.add('invalid');
    };
    var removeErrorMarker = function (formElement) {
      formElement.classList.remove('invalid');
    };

    noticeForm.addEventListener('invalid', function (invalidEvt) {
      var suspectFormElement = invalidEvt.target;
      var noticeFormInputHandler = function (inputEvt) {
        if (inputEvt.target === suspectFormElement) {
          removeErrorMarker(suspectFormElement);
          noticeForm.removeEventListener('input', noticeFormInputHandler, true);
          noticeFormInputHandler = null;
        }
      };
      setErrorMerker(suspectFormElement);
      noticeForm.addEventListener('input', noticeFormInputHandler, true);
    }, true);

    noticeForm.addEventListener('submit', function (submitEvt) {
      submitEvt.preventDefault();
      noticeForm.submit();
      noticeForm.reset();
    });
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule) {
      parent = parentModule;

      var initResult = initElements();
      if (initResult) {
        initNoticeFormValidation(elements.noticeFormElement);
        binding = bindNoticeFormElements();
        binding.updateTimeOut();
        binding.updatePrice();
        binding.updateGuestsSelect();
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
