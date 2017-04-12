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

var PRICE_MAPPING = [0, 1000, 10000];

var ROOMS_AND_GUESTS_MAPPING = [
  ['1', '0'],
  ['2', '3'],
  ['100', '3']
];
var GUESTS_AND_ROOMS_MAPPING = [
  ROOMS_AND_GUESTS_MAPPING[0].slice(0).reverse(),
  ROOMS_AND_GUESTS_MAPPING[1].slice(0).reverse(),
  ROOMS_AND_GUESTS_MAPPING[2].slice(0).reverse(),
];

var PIN_WIDTH = 56;
var PIN_HEIGHT = 75;
var PIN_IMG_WIDTH = 40;
var PIN_IMG_HEIGHT = 40;

var ENTER_KEY_CODE = 13;
var ESCAPE_KEY_CODE = 27;

/** Вспомогательные методы.
 ******************************************************************************/

var getRandomItem = function (array) {
  return array[getRandomInt(0, array.length - 1)];
};

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getRandomItemsWithoutRepetition = function (sourceItems, count) {
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
};

var getRandomSubstitutionWithoutRepetition = function (fromCount, toCount) {
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
};

var format = function (text, formats) {
  for (var index = 0; index < formats.length; index++) {
    text = text.replace('{' + index + '}', formats[index]);
  }
  return text;
};

var createNumberId = function (number, length) {
  var numberAsString = '' + number;
  var leadZeroCount = length - numberAsString.length;
  var prefix = leadZeroCount > 0
    ? Array(leadZeroCount + 1).join('0')
    : '';
  return prefix + numberAsString;
};

var createPinId = function (advertId) {
  return 'pin-' + advertId;
};

var getAdvertId = function (pinId) {
  var lastItem = pinId.split('-').pop();
  return +lastItem;
};

var isActivatedByKeyCode = function (evt, keyCode) {
  return evt.keyCode && evt.keyCode === keyCode;
};

/** Инициализация элементов.
 ******************************************************************************/

var activePinElement = null;
var advertDialogElement = document.querySelector('.dialog');
var advertDialogCloseElement = advertDialogElement.querySelector('.dialog__close');

var advertDialogTitleImage = document.querySelector('.dialog__title img');
var lodgeTemplate = document.querySelector('#lodge-template').content;

var pinMapElement = document.querySelector('.tokyo__pin-map');

var noticeFormElement = document.querySelector('.notice__form');
var timeSelectElement = document.getElementById('time');
var timeoutSelectElement = document.getElementById('timeout');
var lodgingTypeSelectElement = document.getElementById('type');
var priceInputElement = document.getElementById('price');
var roomsSelectElement = document.getElementById('room_number');
var guestsSelectElement = document.getElementById('capacity');

/**
 * Отображает метки объявлений на карте.
 * @param {Array.<Object>} adverts Модели вида объявлений.
 */
var showAdvertLabelsOnMap = function (adverts) {
  var labelsFragment = renderMapLabelFragment(adverts);

  pinMapElement.innerHTML = '';
  pinMapElement.appendChild(labelsFragment);

  initPins();
};

/**
 * Отображает диалоговую панели.
 * @param {Array.<Object>} adverts Модели вида объявлений.
 */
var initAdvertDialogPanel = function (adverts) {
  if (!adverts || adverts.length <= 0) {
    return;
  }
  var initialAdvert = adverts[0];
  var pinId = createPinId(initialAdvert.id);
  var pin = pinMapElement.querySelector('#' + pinId);
  activatePin(pin);
  showAdvertDialogContent(initialAdvert);
};

/** Свзязывание полей формы.
 ******************************************************************************/

var bindPriceToRoomNumber = function (priceInput, lodgingTypeSelect) {
  lodgingTypeSelect.addEventListener('change', function (changeEvt) {
    var newValue = +changeEvt.target.value;
    var minPrice = PRICE_MAPPING[newValue];

    priceInput.min = minPrice;
    priceInput.placeholder = minPrice;

    var currentPrice = parseInt(priceInput.value, 10);
    if (!isNaN(currentPrice) && currentPrice < minPrice) {
      priceInput.value = minPrice;
    }
  });
};

var bindSelectsByOptionValue = function (select1, select2) {
  var synchronizeSelectedOptions = function (value, targetSelect) {
    var targetOption = value && Array.prototype.find.call(targetSelect.options, function (option) {
      return option.value === value;
    });
    if (targetOption) {
      targetOption.selected = true;
    }
  };
  select1.addEventListener('change', function (changeEvt) {
    var newValue = changeEvt.target.value;
    synchronizeSelectedOptions(newValue, select2);
  });
  select2.addEventListener('change', function (changeEvt) {
    var newValue = changeEvt.target.value;
    synchronizeSelectedOptions(newValue, select1);
  });

  var binding = {
    update: function () {
      var selectedValue = select1.options[select1.selectedIndex].value;
      if (selectedValue) {
        synchronizeSelectedOptions(selectedValue, select2);
      }
    }
  };
  binding.update();
};

var bindRoomsWithGuests = function (roomsSelect, guestsSelect) {
  var synchronizeSelectedOptions = function (value, mapping, targetSelect) {
    var mapingTuples = value && Array.prototype.filter.call(mapping, function (item) {
      return item[0] === value;
    });
    var targetValues = mapingTuples && mapingTuples.map(function (tuple) {
      return tuple[1];
    });
    var targetOptions = targetValues && Array.prototype.filter.call(targetSelect.options, function (option) {
      return ~targetValues.indexOf(option.value);
    });
    if (targetOptions && targetOptions.length > 0 && !targetOptions.find(function (option) {
      return option.selected;
    })) {
      targetOptions[0].selected = true;
    }
  };

  roomsSelect.addEventListener('change', function (changeEvt) {
    synchronizeSelectedOptions(changeEvt.target.value, ROOMS_AND_GUESTS_MAPPING, guestsSelect);
  });
  guestsSelect.addEventListener('change', function (changeEvt) {
    synchronizeSelectedOptions(changeEvt.target.value, GUESTS_AND_ROOMS_MAPPING, roomsSelect);
  });

  var binding = {
    update: function () {
      var selectedRoomValue = roomsSelect.options[roomsSelect.selectedIndex].value;
      if (selectedRoomValue) {
        synchronizeSelectedOptions(selectedRoomValue, ROOMS_AND_GUESTS_MAPPING, guestsSelect);
      }
    }
  };
  binding.update();
};

/** Валидация.
 ******************************************************************************/

var initNoticeFormValidation = function (noticeForm, suspectFormElements, formSubmitedHandler) {
  var setErrorMerker = function (formElement) {
    formElement.style.borderColor = 'red';
  };
  var removeErrorMarker = function (formElement) {
    formElement.style.borderColor = null;
  };

  noticeForm.addEventListener('invalid', function (invalidEvt) {
    var suspectFormElement = invalidEvt.target;
    var noticeFormInputHandler = function (inputEvt) {
      removeErrorMarker(suspectFormElement);
      noticeForm.removeEventListener('input', noticeFormInputHandler, true);
      noticeFormInputHandler = null;
    };
    setErrorMerker(suspectFormElement);
    noticeForm.addEventListener('input', noticeFormInputHandler, true);
  }, true);

  noticeForm.addEventListener('submit', function (submitEvt) {
    submitEvt.preventDefault();
    noticeForm.submit();
    noticeForm.reset();
  });
};

/** Инициализация.
 ******************************************************************************/

var advertItems = createAdverts();
showAdvertLabelsOnMap(advertItems);
initAdvertDialogPanel(advertItems);
bindPriceToRoomNumber(priceInputElement, lodgingTypeSelectElement);
bindSelectsByOptionValue(timeSelectElement, timeoutSelectElement);
bindRoomsWithGuests(roomsSelectElement, guestsSelectElement);

initNoticeFormValidation(noticeFormElement);

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
    id: id,
    author: createAuthor(id),
    offer: craeteOffer(title, location),
    location: location
  };
}

function createAuthor(id) {
  var result;
  if (id && id >= 0 && id < 100) {
    result = {
      avatar: format(ADVERT_AUTHOR_AVATAR_URL_FORMAT, [createNumberId(id, 2)])
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
    y: getRandomInt(100 + PIN_HEIGHT, 500)
  };
}

/** Доступ к данным.
 ******************************************************************************/

function getAdvertById(advertId) {
  var advertItem = advertItems.find(function (element) {
    return element.id === advertId;
  });

  return advertItem;
}

function getAdvert(pinElement) {
  var pinId = pinElement.id;
  var advertId = getAdvertId(pinId);
  return getAdvertById(advertId);
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
  var element = document.createElement('div');
  element.id = createPinId(advert.id);
  element.classList.add('pin');
  var xPosition = advert.location.x - Math.round(0.5 * PIN_WIDTH);
  var yPosition = advert.location.y - PIN_HEIGHT;
  element.style.left = xPosition + 'px';
  element.style.top = yPosition + 'px';

  var childElement = document.createElement('img');
  childElement.src = advert.author.avatar;
  childElement.classList.add('rounded');
  childElement.width = PIN_IMG_WIDTH;
  childElement.height = PIN_IMG_HEIGHT;

  element.appendChild(childElement);
  element.tabIndex = '0';

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

/** Управление метками на карте.
 ******************************************************************************/

function initPins() {
  var pinKeydownHandler = null;
  var pins = pinMapElement.querySelectorAll('.pin');

  for (var index = 0; index < pins.length; index++) {
    var pin = pins[index];

    pin.addEventListener('click', function (evt) {
      var pinTarget = evt.currentTarget;
      activatePin(pinTarget);

      var advert = getAdvert(pinTarget);
      showAdvertDialogContent(advert);
    });

    pin.addEventListener('focus', function (focusEvt) {
      pinKeydownHandler = function (keydownEvt) {
        if (isActivatedByKeyCode(keydownEvt, ENTER_KEY_CODE)) {
          var pinTarget = keydownEvt.currentTarget;
          activatePin(pinTarget);

          var advert = getAdvert(pinTarget);
          showAdvertDialogContent(advert);
        }
      };
      focusEvt.currentTarget.addEventListener('keydown', pinKeydownHandler);
    });
    pin.addEventListener('blur', function (blurEvt) {
      blurEvt.currentTarget.removeEventListener('keydown', pinKeydownHandler);
      pinKeydownHandler = null;
    });
  }

  return pins;
}

function activatePin(pin) {
  deactivatePin();
  activePinElement = pin;
  pin.classList.add('pin--active');
  pin.focus();
}

function deactivatePin() {
  if (activePinElement === null) {
    return;
  }
  activePinElement.classList.remove('pin--active');
}

/** Управление карточкой объявления.
 ******************************************************************************/

function showAdvertDialogContent(advert) {
  var advertDialogCloseElementClickHandler = null;
  var advertDialogCloseElementKeydownHandler = null;
  var advertDialogElementKeydownHandler = null;

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

  advertDialogCloseElementClickHandler = function () {
    unsubscribeDialogCloseEvents();
    closeAdvertDialog();
  };
  advertDialogCloseElement.addEventListener('click', advertDialogCloseElementClickHandler);

  advertDialogCloseElementKeydownHandler = function (keydownEvt) {
    if (isActivatedByKeyCode(keydownEvt, ESCAPE_KEY_CODE)) {
      unsubscribeDialogCloseEvents();
      closeAdvertDialog();
    }
  };
  advertDialogCloseElement.addEventListener('keydown', advertDialogCloseElementKeydownHandler);

  advertDialogElementKeydownHandler = function (keydownEvt) {
    if (isActivatedByKeyCode(keydownEvt, ESCAPE_KEY_CODE)) {
      unsubscribeDialogCloseEvents();
      closeAdvertDialog();
    }
  };
  document.addEventListener('keydown', advertDialogElementKeydownHandler);

  renderAdvertDialog(advert);
  advertDialogElement.style.display = 'block';
}

function closeAdvertDialog() {
  var dialog = advertDialogElement;

  dialog.style.display = 'none';
  deactivatePin(activePinElement);
}

function renderAdvertDialog(advert) {
  var dialog = advertDialogElement;
  var dialogPanel = dialog.querySelector('.dialog__panel');

  var lodgeFragment = renderLodgeFragment(lodgeTemplate, advert);
  dialog.replaceChild(lodgeFragment, dialogPanel);

  advertDialogTitleImage.src = advert.author.avatar;
}
