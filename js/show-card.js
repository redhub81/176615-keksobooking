// show-card.js
'use strict';

window.showCard = (function () {
  var showResult;
  var modulesCache;
  var elements;

  var currentAdvertId = -1;
  var advertDialogCloseElementClickHandler = null;
  var advertDialogCloseElementKeydownHandler = null;
  var advertDialogElementKeydownHandler = null;

  /** Управление карточкой объявления.
   ******************************************************************************/

  var unsubscribeDialogCloseEvents = function () {
    if (advertDialogCloseElementClickHandler) {
      elements.advertDialogCloseElement.removeEventListener('click', advertDialogCloseElementClickHandler);
      advertDialogCloseElementClickHandler = null;
    }
    if (advertDialogCloseElementKeydownHandler) {
      elements.advertDialogCloseElement.removeEventListener('keydown', advertDialogCloseElementKeydownHandler);
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
    modulesCache.card.hide();
    showResult.onClose(currentAdvertId);
    currentAdvertId = -1;
  };

  var subscribeDialogCloseEvents = function () {
    advertDialogCloseElementClickHandler = function () {
      closeAdvertDialog();
    };
    elements.advertDialogCloseElement.addEventListener('click', advertDialogCloseElementClickHandler);

    advertDialogCloseElementKeydownHandler = function (keydownEvt) {
      if (modulesCache.eventHelper.isActivatedByKeyCode(keydownEvt, modulesCache.eventHelper.keys.enter)) {
        closeAdvertDialog();
      }
    };
    elements.advertDialogCloseElement.addEventListener('keydown', advertDialogCloseElementKeydownHandler);

    advertDialogElementKeydownHandler = function (keydownEvt) {
      if (modulesCache.eventHelper.isActivatedByKeyCode(keydownEvt, modulesCache.eventHelper.keys.escape)) {
        closeAdvertDialog();
      }
    };
    document.addEventListener('keydown', advertDialogElementKeydownHandler);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  return function (advert, cardModule, eventHelperModule, elementsCache) {
    modulesCache = {
      card: cardModule,
      eventHelper: eventHelperModule
    };
    elements = elementsCache;

    unsubscribeDialogCloseEvents();
    modulesCache.card.render(advert);
    subscribeDialogCloseEvents();

    modulesCache.card.show();
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
