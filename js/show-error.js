// show-error.js
'use strict';

window.showError = (function () {
  var errorDialogElement = document.getElementById('error-dialog');
  var errorDialogCloseElement = errorDialogElement.querySelector('.error__close');
  var errorDialogContent = errorDialogElement.querySelector('.error__content');

  var errorDialogCloseElementClickHandler;
  var errorDialogCloseElementKeydownHandler;
  var errorDialogElementKeydownHandler;

  var renderErrorFragment = function (message) {
    errorDialogContent.textContent = message;
  };

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
    errorDialogElement.style.display = 'none';
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

  return function (errorMessage) {
    renderErrorFragment(errorMessage);
    subscribeEvents();
    errorDialogElement.style.display = 'block';
  };
})();
