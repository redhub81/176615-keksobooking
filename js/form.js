// form.js
'use strict';

window.form = (function () {
  var thisModule;
  var modulesCache;
  var elementsCache = {};
  var binding = {};

  /** Доступ к эелементам.
   ******************************************************************************/

  var initElements = function () {
    var formElement = document.querySelector('.notice__form');
    elementsCache.noticeFormElement = formElement;
    elementsCache.timeSelectElement = formElement.querySelector('#time');
    elementsCache.timeoutSelectElement = formElement.querySelector('#timeout');
    elementsCache.lodgingTypeSelectElement = formElement.querySelector('#type');
    elementsCache.priceInputElement = formElement.querySelector('#price');
    elementsCache.roomsSelectElement = formElement.querySelector('#room_number');
    elementsCache.guestsSelectElement = formElement.querySelector('#capacity');
    elementsCache.addressElement = formElement.querySelector('#address');

    for (var elementKey in elementsCache) {
      if (typeof elementsCache[elementKey] === 'undefined' || elementsCache[elementKey] === null) {
        return false;
      }
    }
    return true;
  };

  /** Свзязывание полей формы.
   ******************************************************************************/

  var updateBinding = function () {
    binding.updateTimeout();
    binding.updatePrice();
    binding.updateGuestsSelect();
  };

  /** Валидация.
   ******************************************************************************/

  var initNoticeFormValidation = function (noticeForm) {
    var setErrorMarker = function (formElement) {
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
      setErrorMarker(suspectFormElement);
      noticeForm.addEventListener('input', noticeFormInputHandler, true);
    }, true);

    noticeForm.addEventListener('submit', function (submitEvt) {
      submitEvt.preventDefault();

      thisModule.onSubmiting();

      noticeForm.reset();
      updateBinding();

      thisModule.onSubmit();
    });
  };

  /** Обработка ввода.
   ******************************************************************************/

  var setAddress = function (text) {
    elementsCache.addressElement.value = text;
  };

  var subscribeAddressChanged = function (addressElement) {
    addressElement.addEventListener('change', function (changeEvt) {
      var addressInfo = {oldAddress: null, newAddress: changeEvt.target.value};
      thisModule.onAddressChanged(addressInfo);
      setAddress(addressInfo.newAddress);
    });
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} parentModulesCache Предоставляет доступ к модулям.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, parentModulesCache) {
      modulesCache = {
        parent: parentModule,
        synchronizeFields: parentModulesCache.synchronizeFields
      };

      var initResult = initElements();
      if (initResult) {
        initNoticeFormValidation(elementsCache.noticeFormElement);

        binding.updatePrice = modulesCache.synchronizeFields(elementsCache.lodgingTypeSelectElement, elementsCache.priceInputElement,
          ['0', '1', '2'], ['0', '1000', '10000'], function (element, value) {
            element.min = value;
            element.placeholder = value;
            var currentPrice = parseInt(element.value, 10);
            if (!isNaN(currentPrice) && currentPrice < value) {
              element.value = '';
            }
          }).updateTarget;

        var setSelectValueHandler = function (element, value) {
          if (element.value !== value) {
            element.value = value;
          }
        };

        var roomKeyValues = ['0', '1'];
        var guestKeyValues = ['0', '1'];
        binding.updateGuestsSelect = modulesCache.synchronizeFields(elementsCache.roomsSelectElement, elementsCache
          .guestsSelectElement, roomKeyValues, guestKeyValues, setSelectValueHandler).updateTarget;
        modulesCache.synchronizeFields(elementsCache.guestsSelectElement, elementsCache
          .roomsSelectElement, guestKeyValues, roomKeyValues, setSelectValueHandler);

        var timeKeyValues = ['12', '13', '14'];
        var timeoutKeyValues = ['12', '13', '14'];
        binding.updateTimeout = modulesCache.synchronizeFields(elementsCache.timeSelectElement, elementsCache
          .timeoutSelectElement, timeKeyValues, timeoutKeyValues, setSelectValueHandler).updateTarget;
        modulesCache.synchronizeFields(elementsCache.timeoutSelectElement, elementsCache
          .timeSelectElement, timeKeyValues, timeoutKeyValues, setSelectValueHandler);

        updateBinding();
      }

      subscribeAddressChanged(elementsCache.addressElement);
      return initResult;
    },
    /**
     * Возвращает родительский модуль.
     * @return {Object} родительский модуль.
     */
    getParent: function () {
      return modulesCache.parent;
    },
    /**
     * Задает новое значение поля адреса.
     * @param {string} text Текст поля адреса.
     */
    setAddress: setAddress,
    /**
     * Вызывается после изменения адреса.
     * @param {Object} addressInfo Новое значение адреса.
     */
    onAddressChanged: function (addressInfo) {},
    /**
     * Вызывается при отправке данных формы.
     * @param {Object} formData данные формы.
     */
    onSubmiting: function (formData) {},
    /**
     * Вызывается после отправке данных формы.
     * @param {Object} formData данные формы.
     */
    onSubmit: function (formData) {}
  };
  return thisModule;
})();
