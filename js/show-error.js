// show-error.js
'use strict';

window.showError = (function () {
  var errorDialogCloseElementClickHandler;
  var errorDialogCloseElementKeydownHandler;
  var errorDialogElementKeydownHandler;

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var errorDialogElement = document.getElementById('error-dialog');
  var errorDialogCloseElement = errorDialogElement.querySelector('.error__close');
  var errorDialogContentElement = errorDialogElement.querySelector('.error__content');

  /** Отрисовка сообщения об ошибке.
   ******************************************************************************/

  var renderError = function (message) {
    errorDialogContentElement.textContent = message;
  };

  var showError = function () {
    errorDialogElement.style.display = 'block';
  };

  var hideError = function () {
    errorDialogElement.style.display = 'none';
  };

  /** Подписка на события.
   ******************************************************************************/

  var unsubscribeEvents = function () {
    if (errorDialogCloseElementClickHandler) {
      errorDialogCloseElement.removeEventListener('click', errorDialogCloseElementClickHandler);
    }
    if (errorDialogCloseElementKeydownHandler) {
      errorDialogCloseElement.removeEventListener('keydown', errorDialogCloseElementKeydownHandler);
    }
    if (errorDialogElementKeydownHandler) {
      document.removeEventListener('keydown', errorDialogElementKeydownHandler);
    }
  };

  var closeErrorDialog = function () {
    unsubscribeEvents();
    hideError();
  };

  var subscribeEvents = function () {
    errorDialogCloseElementClickHandler = function () {
      closeErrorDialog();
    };
    errorDialogElement.addEventListener('click', errorDialogCloseElementClickHandler);

    errorDialogCloseElementKeydownHandler = function (keydownEvt) {
      if (window.eventHelper.isActivatedByKeyCode(keydownEvt, window.eventHelper.keys.enter)) {
        closeErrorDialog();
      }
    };
    errorDialogElement.addEventListener('keydown', errorDialogCloseElementKeydownHandler);

    errorDialogElementKeydownHandler = function (keydownEvt) {
      if (window.eventHelper.isActivatedByKeyCode(keydownEvt, window.eventHelper.keys.escape)) {
        closeErrorDialog();
      }
    };
    document.addEventListener('keydown', errorDialogElementKeydownHandler);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return function (errorMessage) {
    renderError(errorMessage);
    subscribeEvents();
    showError();
  };
})();
