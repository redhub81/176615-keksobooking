// map.js
'use strict';

/** Настройки.
 ******************************************************************************/

var ADVERT_AUTHOR_AVATAR_URL_FORMAT = 'img/avatars/user{0}.png';
var ADVERT_OFFER_ADDRESS_FORMAT = '{0}, {1}';
var ADVERT_OFFER_PRICE_FORMAT = '{0}&#x20bd;/ночь';
var ADVERT_OFFER_CHECK_TIME_FORMAT = 'Заезд после {0}, выезд до {1}';

var ADVERT_OFFER_TITLES = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];

var ADVERT_OFFER_TYPES = [
  'flat',
  'house',
  'bungalo'
];

var ADVERT_OFFER_CHECK_TIME = [
  '12:00',
  '13:00',
  '14:00'
];

var ADVERT_OFFER_FEATURES = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];

var ADVERT_OFFER_TYPE_LABELS = {
  flat: 'Квартира',
  house: 'Дом',
  bungalo: 'Бунгало'
};

/** Предоставляемые методы.
 ******************************************************************************/

/**
 * Отображает метки объявлений на карте.
 * @param {Array.<Object>} adverts Модели вида объявлений.
 */
var showAdvertLabelsOnMap = function (adverts) {
  var map = document.querySelector('.tokyo__pin-map');
  var labelsFragment = renderMapLabelFragment(adverts);
  map.appendChild(labelsFragment);
};

/**
 * Отображает диалоговую панели.
 * @param {Array.<Object>} adverts Модели вида объявлений.
 */
var showDialogPanel = function (adverts) {
  var userDialogTitleImage = document.querySelector('.dialog__title img');

  var offerDialog = document.querySelector('.dialog__panel');
  var offerDialogParent = offerDialog.parentNode;

  var selectedAdvert = adverts[0];
  var lodgeTemplate = document.querySelector('#lodge-template').content;
  var lodgeFragment = renderLodgeFragment(lodgeTemplate, selectedAdvert);
  offerDialogParent.replaceChild(lodgeFragment, offerDialog);
  userDialogTitleImage.src = selectedAdvert.author.avatar;
};

var advertItems = createAdverts();
showAdvertLabelsOnMap(advertItems);
showDialogPanel(advertItems);

/** Создание моделей вида.
 ******************************************************************************/

function createAdverts() {
  var adverts = [];

  var advertCount = ADVERT_OFFER_TITLES.length;
  var titleSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);
  var numberSubstitution = getRandomSubstitutionWithoutRepetition(advertCount, advertCount);

  for (var number = 0; number < advertCount; number++) {
    var title = getOfferTitle(number, titleSubstitution);
    var id = 1 + numberSubstitution[number];

    var advert = createAdvert(id, title);
    adverts.push(advert);
  }

  return adverts;
}

function createAdvert(id, title) {
  var location = createLocation();
  return {
    author: createAuthor(id),
    offer: craeteOffer(title, location),
    location: location
  };
}

function createAuthor(id) {
  var result;
  if (id > 0 && id < 10) {
    var numberAsString = '0' + id;
    result = {
      avatar: format(ADVERT_AUTHOR_AVATAR_URL_FORMAT, [numberAsString])
    };
  }

  return result;
}

function craeteOffer(title, location) {
  return {
    title: title,
    address: format(ADVERT_OFFER_ADDRESS_FORMAT, [location.x, location.y]),
    price: getRandomInt(1000, 1000000),
    type: getRandomItem(ADVERT_OFFER_TYPES),
    rooms: getRandomInt(1, 5),
    guests: getRandomInt(1, 10),
    checkin: getRandomItem(ADVERT_OFFER_CHECK_TIME),
    checkout: getRandomItem(ADVERT_OFFER_CHECK_TIME),
    features: getRandomItemsWithoutRepetition(ADVERT_OFFER_FEATURES, getRandomInt(0, ADVERT_OFFER_FEATURES.length)),
    description: '',
    photos: []
  };
}

function getOfferTitle(number, substitution) {
  return ADVERT_OFFER_TITLES[substitution[number]];
}

function createLocation() {
  return {
    x: getRandomInt(300, 900),
    y: getRandomInt(100, 500)
  };
}

/** Отображение моделей вида.
 ******************************************************************************/

function renderMapLabelFragment(adverts) {
  var labelsFragment = document.createDocumentFragment();
  var labels = renderMapLabels(adverts);
  for (var index = 0; index < labels.length; index++) {
    labelsFragment.appendChild(labels[index]);
  }

  return labelsFragment;
}

function renderMapLabels(adverts) {
  var elements = [];
  for (var index = 0; index < adverts.length; index++) {
    var labelElement = createMapLabelElement(adverts[index]);
    elements.push(labelElement);
  }

  return elements;
}

function createMapLabelElement(advert) {
  var WIDTH = 56;
  var HEIGHT = 75;
  var IMG_WIDTH = 40;
  var IMG_HEIGHT = 40;

  var element = document.createElement('div');

  element.classList.add('pin');
  var xPosition = advert.location.x - Math.round(0.5 * WIDTH);
  var yPosition = advert.location.y - HEIGHT;
  element.style.left = xPosition + 'px';
  element.style.top = yPosition + 'px';

  var childElement = document.createElement('img');
  childElement.src = advert.author.avatar;
  childElement.classList.add('rounded');
  childElement.width = IMG_WIDTH;
  childElement.height = IMG_HEIGHT;

  element.appendChild(childElement);

  return element;
}

function renderLodgeFragment(template, advert) {
  var element = template.cloneNode(true);

  element.querySelector('.lodge__title').textContent = advert.offer.title;
  element.querySelector('.lodge__address').textContent = advert.offer.address;
  element.querySelector('.lodge__price').innerHTML = format(ADVERT_OFFER_PRICE_FORMAT, [advert.offer.price]);
  element.querySelector('.lodge__type').textContent = ADVERT_OFFER_TYPE_LABELS[advert.offer.type];
  element.querySelector('.lodge__rooms-and-guests').textContent = format(ADVERT_OFFER_CHECK_TIME_FORMAT,
    [advert.offer.checkin, advert.offer.checkout]);

  for (var index = 0; index < advert.offer.features.length; index++) {
    var feature = advert.offer.features[index];
    var featureClassFormat = '"feature__image feature__image--{0}';
    var featureClass = format(featureClassFormat, [feature]);

    var featureElement = document.createElement('span');
    featureElement.className = featureClass;

    element.querySelector('.lodge__features').appendChild(featureElement);
  }

  element.querySelector('.lodge__description').textContent = advert.offer.description;

  return element;
}

/** Вспомогательные методы.
 ******************************************************************************/

function getRandomItem(array) {
  return array[getRandomInt(0, array.length - 1)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItemsWithoutRepetition(sourceItems, count) {
  var result;
  if (sourceItems.length >= count) {
    var substitution = getRandomSubstitutionWithoutRepetition(sourceItems.length, count);
    var orderedSubstitution = substitution.sort();

    var items = [];
    for (var index = 0; index < orderedSubstitution.length; index++) {
      items.push(sourceItems[orderedSubstitution[index]]);
    }
    result = items;
  }

  return result;
}

function getRandomSubstitutionWithoutRepetition(fromCount, toCount) {
  var substitution = [];
  var valueDictionary = {};
  for (var index = 0; index < toCount; index++) {
    do {
      var value = getRandomInt(0, fromCount - 1);
      var valueAsString = '' + value;
    } while (valueAsString in valueDictionary);
    valueDictionary[valueAsString] = value;
    substitution[index] = value;
  }

  return substitution;
}

function format(text, formats) {
  for (var index = 0; index < formats.length; index++) {
    text = text.replace('{' + index + '}', formats[index]);
  }

  return text;
}
