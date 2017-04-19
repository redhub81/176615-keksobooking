// card.js
'use strict';

window.card = (function () {
  var thisModule;
  var parent;
  var settings;
  var textHelper;
  var eventHelper;
  var data;

  var currentAdvertId = -1;
  var elements = null;

  var advertDialogCloseElementClickHandler = null;
  var advertDialogCloseElementKeydownHandler = null;
  var advertDialogElementKeydownHandler = null;

  /** Отрисовка карточки объявления.
   ******************************************************************************/

  var renderLodgeFragment = function (template, advert) {
    var element = template.cloneNode(true);

    element.querySelector('.lodge__title').textContent = advert.offer.title;
    element.querySelector('.lodge__address').textContent = advert.offer.address;
    element.querySelector('.lodge__price').innerHTML = textHelper
      .format(settings.advert.offer.formats.price, [advert.offer.price]);
    element.querySelector('.lodge__type').textContent = settings.advert.offer.type.labels[advert.offer.type];
    element.querySelector('.lodge__rooms-and-guests').textContent = textHelper
      .format(settings.advert.offer.formats.roomsAndGuests, [advert.offer.guests, advert.offer.rooms]);
    element.querySelector('.lodge__checkin-time').textContent = textHelper
      .format(settings.advert.offer.formats.checkTime, [advert.offer.checkin, advert.offer.checkout]);

    var featureContainerElement = element.querySelector('.lodge__features');
    for (var index = 0; index < advert.offer.features.length; index++) {
      var feature = advert.offer.features[index];
      var featureClassFormat = 'feature__image feature__image--{{0}}';
      var featureClass = textHelper.format(featureClassFormat, [feature]);

      var featureElement = document.createElement('span');
      featureElement.className = featureClass;

      featureContainerElement.appendChild(featureElement);
    }
    element.querySelector('.lodge__description').textContent = advert.offer.description;
    return element;
  };

  var renderAdvertDialog = function (advert) {
    var dialog = elements.advertDialogElement;
    var dialogPanel = dialog.querySelector('.dialog__panel');

    var lodgeFragment = renderLodgeFragment(elements.lodgeTemplate, advert);
    dialog.replaceChild(lodgeFragment, dialogPanel);

    elements.advertDialogTitleImage.src = advert.author.avatar;
  };

  var clearAdvertDialog = function () {
    var dialogPanel = elements.advertDialogElement.querySelector('.dialog__panel');
    dialogPanel.innerHTML = '';
  };

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
    elements.advertDialogElement.style.display = 'none';

    unsubscribeDialogCloseEvents();
    clearAdvertDialog();

    thisModule.onClose(currentAdvertId);
    currentAdvertId = -1;
  };

  var subscribeDialogCloseEvents = function () {
    advertDialogCloseElementClickHandler = function () {
      closeAdvertDialog();
    };
    elements.advertDialogCloseElement.addEventListener('click', advertDialogCloseElementClickHandler);

    advertDialogCloseElementKeydownHandler = function (keydownEvt) {
      if (eventHelper.isActivatedByKeyCode(keydownEvt, eventHelper.keys.escape)) {
        closeAdvertDialog();
      }
    };
    elements.advertDialogCloseElement.addEventListener('keydown', advertDialogCloseElementKeydownHandler);

    advertDialogElementKeydownHandler = function (keydownEvt) {
      if (eventHelper.isActivatedByKeyCode(keydownEvt, eventHelper.keys.escape)) {
        closeAdvertDialog();
      }
    };
    document.addEventListener('keydown', advertDialogElementKeydownHandler);
  };

  var showAdvertDialog = function (advert) {
    subscribeDialogCloseEvents();

    renderAdvertDialog(advert);
    elements.advertDialogElement.style.display = 'block';

    thisModule.onShow(advert.id);
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} allModules Предоставляет доступ ко всем модулям.
     * @param {Object} allElements Предоставляет дотуп к элементам.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, allModules, allElements) {
      parent = parentModule;
      settings = allModules.settings;
      textHelper = allModules.textHelper;
      eventHelper = allModules.eventHelper;
      data = allModules.data;

      elements = allElements;

      return true;
    },
    /**
     * Возвращает родительский модуль.
     * @return {Object} родительский модуль.
     */
    getParent: function () {
      return parent;
    },
    /**
     * Отображает диалоговую панели объявления.
     * @param {int} advertId Идентификатор объявления.
     */
    show: function (advertId) {
      var advert = data.getAdvertById(advertId);
      showAdvertDialog(advert);
      currentAdvertId = advert.id;
    },
    /**
     * Вызывается после отображения диалоговой панели объявления.
     * @param {Object} advert Модель вида объявления.
     */
    onShow: function (advert) {},
    /**
     * Вызывается после закрытия диалоговой панели объявления.
     * @param {int} advertId Идентификатор объявления.
     */
    onClose: function (advertId) {}
  };

  return thisModule;
})();
