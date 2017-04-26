// form.js
'use strict';

window.form = (function () {
  var LODGING_TYPE_TO_PRICE_MAPPING = ['0', '1', '2'];
  var PRICE_TO_LODGING_TYPE_MAPPING = ['0', '1000', '10000'];

  var thisModule;
  var binding = {};

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var formElement = document.querySelector('.notice__form');
  var noticeFormElement = formElement;
  var timeSelectElement = formElement.querySelector('#time');
  var timeoutSelectElement = formElement.querySelector('#timeout');
  var lodgingTypeSelectElement = formElement.querySelector('#type');
  var priceInputElement = formElement.querySelector('#price');
  var roomsSelectElement = formElement.querySelector('#room_number');
  var guestsSelectElement = formElement.querySelector('#capacity');
  var addressElement = formElement.querySelector('#address');

  /** Свзязывание полей формы.
   ******************************************************************************/

  var updateBinding = function () {
    binding.updateTimeout();
    binding.updatePrice();
    binding.updateGuestsSelect();
  };

  /** Валидация.
   ******************************************************************************/

  var setAutoResetFormBehavior = function (targetForm, onFormSubmiting, onFormSubmited) {
    var setErrorMarker = function (targetElement) {
      targetElement.classList.add('invalid');
    };
    var removeErrorMarker = function (targetElement) {
      targetElement.classList.remove('invalid');
    };

    targetForm.addEventListener('invalid', function (invalidEvt) {
      var suspectElement = invalidEvt.target;
      var targetFormInputHandler = function (inputEvt) {
        if (inputEvt.target === suspectElement) {
          removeErrorMarker(suspectElement);
          targetForm.removeEventListener('input', targetFormInputHandler, true);
          targetFormInputHandler = null;
        }
      };
      setErrorMarker(suspectElement);
      targetForm.addEventListener('input', targetFormInputHandler, true);
    }, true);

    targetForm.addEventListener('submit', function (submitEvt) {
      submitEvt.preventDefault();

      onFormSubmiting();
      targetForm.reset();
      onFormSubmited();
    });
  };

  /** Обработка ввода.
   ******************************************************************************/

  var setAddress = function (text) {
    addressElement.value = text;
  };

  /** Подписка на события.
   ******************************************************************************/

  setAutoResetFormBehavior(noticeFormElement, function () {
    thisModule.onSubmitting();
  }, function () {
    updateBinding();
    thisModule.onSubmit();
  });

  binding.updatePrice = window.synchronizeFields(lodgingTypeSelectElement, priceInputElement, LODGING_TYPE_TO_PRICE_MAPPING, PRICE_TO_LODGING_TYPE_MAPPING, function (element, value) {
    element.min = value;
    element.placeholder = value;
    var currentPrice = parseInt(element.value, 10);
    if (!isNaN(currentPrice) && currentPrice < value) {
      element.value = '';
    }
  });

  var setSelectValueHandler = function (element, value) {
    if (element.value !== value) {
      element.value = value;
    }
  };

  var ROOM_TO_GUEST_MAPPING = ['0', '1'];
  var GUEST_TO_ROOM_MAPPING = ['0', '1'];
  binding.updateGuestsSelect = window.synchronizeFields(roomsSelectElement, guestsSelectElement, ROOM_TO_GUEST_MAPPING, GUEST_TO_ROOM_MAPPING, setSelectValueHandler);
  window.synchronizeFields(guestsSelectElement, roomsSelectElement, GUEST_TO_ROOM_MAPPING, ROOM_TO_GUEST_MAPPING, setSelectValueHandler);

  var TIMEIN_TO_TIMEOUT_MAPPING = ['12', '13', '14'];
  var TIMEOUT_TO_TIMEIN_MAPPING = ['12', '13', '14'];
  binding.updateTimeout = window.synchronizeFields(timeSelectElement, timeoutSelectElement, TIMEIN_TO_TIMEOUT_MAPPING, TIMEOUT_TO_TIMEIN_MAPPING, setSelectValueHandler);
  window.synchronizeFields(timeoutSelectElement, timeSelectElement, TIMEOUT_TO_TIMEIN_MAPPING, TIMEIN_TO_TIMEOUT_MAPPING, setSelectValueHandler);

  updateBinding();

  addressElement.addEventListener('change', function (changeEvt) {
    var addressInfo = {oldAddress: null, newAddress: changeEvt.target.value};
    thisModule.onAddressChanged(addressInfo);
    setAddress(addressInfo.newAddress);
  });

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
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
     */
    onSubmitting: function () {},
    /**
     * Вызывается после отправке данных формы.
     */
    onSubmit: function () {}
  };
  return thisModule;
})();
