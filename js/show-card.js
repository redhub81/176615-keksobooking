// show-card.js
'use strict';

window.showCard = (function () {
  var showResult;
  var currentAdvertId = -1;
  var advertDialogCloseElementClickHandler = null;
  var advertDialogCloseElementKeydownHandler = null;
  var advertDialogElementKeydownHandler = null;

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var advertDialogCloseElement = document.querySelector('.dialog .dialog__close');

  /** Управление карточкой объявления.
   ******************************************************************************/

  var unsubscribeDialogCloseEvents = function () {
    if (advertDialogCloseElementClickHandler) {
      advertDialogCloseElement.removeEventListener('click', advertDialogCloseElementClickHandler);
      advertDialogCloseElementClickHandler = null;
    }
    if (advertDialogCloseElementKeydownHandler) {
      advertDialogCloseElement.removeEventListener('keydown', advertDialogCloseElementKeydownHandler);
      advertDialogCloseElementKeydownHandler = null;
    }
    if (advertDialogElementKeydownHandler) {
      document.removeEventListener('keydown', advertDialogElementKeydownHandler);
      advertDialogElementKeydownHandler = null;
    }
  };

  var closeAdvertDialog = function () {
    if (currentAdvertId === -1) {
      return;
    }
    unsubscribeDialogCloseEvents();
    window.card.hide();
    showResult.onClose(currentAdvertId);
    currentAdvertId = -1;
  };

  var subscribeDialogCloseEvents = function () {
    advertDialogCloseElementClickHandler = function () {
      closeAdvertDialog();
    };
    advertDialogCloseElement.addEventListener('click', advertDialogCloseElementClickHandler);

    advertDialogCloseElementKeydownHandler = function (keydownEvt) {
      if (window.eventHelper.isActivatedByKeyCode(keydownEvt, window.eventHelper.keys.enter)) {
        closeAdvertDialog();
      }
    };
    advertDialogCloseElement.addEventListener('keydown', advertDialogCloseElementKeydownHandler);

    advertDialogElementKeydownHandler = function (keydownEvt) {
      if (window.eventHelper.isActivatedByKeyCode(keydownEvt, window.eventHelper.keys.escape)) {
        closeAdvertDialog();
      }
    };
    document.addEventListener('keydown', advertDialogElementKeydownHandler);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return function (advert) {
    unsubscribeDialogCloseEvents();
    window.card.render(advert);
    subscribeDialogCloseEvents();

    window.card.show();
    currentAdvertId = advert.id;

    showResult = {
      /**
       * Вызывается после закрытия диалоговой панели объявления.
       * @param {int} advertId Идентификатор объявления.
       */
      onClose: function (advertId) {}
    };
    return showResult;
  };
})();
