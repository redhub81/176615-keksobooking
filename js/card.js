// card.js
'use strict';

window.card = (function () {
  var thisModule;
  var modulesCache;
  var elementsCache;

  /** Отрисовка карточки объявления.
   ******************************************************************************/

  var renderLodgeFragment = function (template, advert) {
    var OFFER_SETTINGS = modulesCache.settings.advert.offer;
    var element = template.cloneNode(true);

    element.querySelector('.lodge__title').textContent = advert.offer.title;
    element.querySelector('.lodge__address').textContent = advert.offer.address;
    element.querySelector('.lodge__price').innerHTML = modulesCache.textHelper
      .format(OFFER_SETTINGS.formats.price, [advert.offer.price]);
    element.querySelector('.lodge__type').textContent = OFFER_SETTINGS.type.labels[advert.offer.type];
    element.querySelector('.lodge__rooms-and-guests').textContent = modulesCache.textHelper
      .format(OFFER_SETTINGS.formats.roomsAndGuests, [advert.offer.guests, advert.offer.rooms]);
    element.querySelector('.lodge__checkin-time').textContent = modulesCache.textHelper
      .format(OFFER_SETTINGS.formats.checkTime, [advert.offer.checkin, advert.offer.checkout]);

    var featureContainerElement = element.querySelector('.lodge__features');
    for (var index = 0; index < advert.offer.features.length; index++) {
      var feature = advert.offer.features[index];
      var featureClassFormat = 'feature__image feature__image--{{0}}';
      var featureClass = modulesCache.textHelper.format(featureClassFormat, [feature]);

      var featureElement = document.createElement('span');
      featureElement.className = featureClass;

      featureContainerElement.appendChild(featureElement);
    }
    element.querySelector('.lodge__description').textContent = advert.offer.description;
    return element;
  };

  var renderAdvertDialog = function (advert) {
    var dialog = elementsCache.advertDialogElement;
    var dialogPanel = dialog.querySelector('.dialog__panel');

    var lodgeFragment = renderLodgeFragment(elementsCache.lodgeTemplate, advert);
    dialog.replaceChild(lodgeFragment, dialogPanel);

    elementsCache.advertDialogTitleImage.src = advert.author.avatar;
  };

  var showAdvertDialog = function () {
    elementsCache.advertDialogElement.style.display = 'block';
  };

  var hideAdvertDialog = function () {
    elementsCache.advertDialogElement.style.display = 'none';
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Инициализирует модуль.
     * @param {Object} parentModule Родительский модуль.
     * @param {Object} parentModulesCache Предоставляет доступ к модулям.
     * @param {Object} parentElementsCache Предоставляет дотуп к элементам.
     * @return {boolean} true - в случае успешной инициализации, иначе false.
     */
    init: function (parentModule, parentModulesCache, parentElementsCache) {
      modulesCache = {
        parent: parentModule,
        settings: parentModulesCache.settings,
        textHelper: parentModulesCache.textHelper
      };
      elementsCache = parentElementsCache;
      return true;
    },
    /**
     * Возвращает родительский модуль.
     * @return {Object} родительский модуль.
     */
    getParent: function () {
      return modulesCache.parent;
    },
    /**
     * Отрисовывает объявление.
     * @param {Object} advert Предоставляет данные объявления.
     */
    render: renderAdvertDialog,
    /**
     * Отображает панель объявления.
     */
    show: showAdvertDialog,
    /**
     * Скрывает панель объявления.
     */
    hide: hideAdvertDialog
  };

  return thisModule;
})();
