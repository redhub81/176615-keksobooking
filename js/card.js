// card.js
'use strict';

window.card = (function () {
  var OFFER_SETTINGS = window.settings.advert.offer;

  var thisModule;

  /** Инициализация доступа к визуальным элементам.
   ******************************************************************************/

  var lodgeTemplate = document.querySelector('#lodge-template').content;
  var advertDialogElement = document.querySelector('.dialog');
  var advertDialogTitleImage = advertDialogElement.querySelector('.dialog__title img');

  /** Отрисовка карточки объявления.
   ******************************************************************************/

  var renderLodgeFragment = function (template, advert) {
    var element = template.cloneNode(true);

    element.querySelector('.lodge__title').textContent = advert.offer.title;
    element.querySelector('.lodge__address').textContent = advert.offer.address;
    element.querySelector('.lodge__price').innerHTML = window.textHelper
      .format(OFFER_SETTINGS.formats.price, [advert.offer.price]);
    element.querySelector('.lodge__type').textContent = OFFER_SETTINGS.type.labels[advert.offer.type];
    element.querySelector('.lodge__rooms-and-guests').textContent = window.textHelper
      .format(OFFER_SETTINGS.formats.roomsAndGuests, [advert.offer.guests, advert.offer.rooms]);
    element.querySelector('.lodge__checkin-time').textContent = window.textHelper
      .format(OFFER_SETTINGS.formats.checkTime, [advert.offer.checkin, advert.offer.checkout]);
    element.querySelector('.lodge__description').textContent = advert.offer.description;

    var featureContainerElement = element.querySelector('.lodge__features');
    for (var index = 0; index < advert.offer.features.length; index++) {
      var feature = advert.offer.features[index];
      var featureClassFormat = 'feature__image feature__image--{{0}}';
      var featureClass = window.textHelper.format(featureClassFormat, [feature]);

      var featureElement = document.createElement('span');
      featureElement.className = featureClass;

      featureContainerElement.appendChild(featureElement);
    }

    return element;
  };

  /** Публикация интерфейса модуля.
   ******************************************************************************/

  thisModule = {
    /**
     * Отрисовывает объявление.
     * @param {Object} advert Предоставляет данные объявления.
     */
    render: function (advert) {
      var dialogPanel = advertDialogElement.querySelector('.dialog__panel');

      var lodgeFragment = renderLodgeFragment(lodgeTemplate, advert);
      advertDialogElement.replaceChild(lodgeFragment, dialogPanel);

      advertDialogTitleImage.src = advert.author.avatar;
    },
    /**
     * Отображает панель объявления.
     */
    show: function () {
      advertDialogElement.style.display = 'block';
    },
    /**
     * Скрывает панель объявления.
     */
    hide: function () {
      advertDialogElement.style.display = 'none';
    }
  };

  return thisModule;
})();
