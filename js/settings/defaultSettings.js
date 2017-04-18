// settings.js
'use strict';

window.defaultSettings = (function () {
  return {
    ADVERT: {
      OFFER: {
        TYPE: {
          KINDS: [
            'flat',
            'house',
            'bungalo'
          ],
          LABELS: {
            flat: 'Квартира',
            house: 'Дом',
            bungalo: 'Бунгало'
          }
        },
        FORMATS: {
          ADDRESS: '{0}, {1}',
          PRICE: '{0}&#x20bd;/ночь',
          CHECK_TIME: 'Заезд после {0}, выезд до {1}'
        },
        TITLES: [
          'Большая уютная квартира',
          'Маленькая неуютная квартира',
          'Огромный прекрасный дворец',
          'Маленький ужасный дворец',
          'Красивый гостевой домик',
          'Некрасивый негостеприимный домик',
          'Уютное бунгало далеко от моря',
          'Неуютное бунгало по колено в воде'
        ],
        CHECK_TIME: [
          '12:00',
          '13:00',
          '14:00'
        ],
        FEATURES: [
          'wifi',
          'dishwasher',
          'parking',
          'washer',
          'elevator',
          'conditioner'
        ]
      },
      AUTHOR: {
        AVATAR: {
          FORMATS: {
            URL: 'img/avatars/user{0}.png'
          }
        }
      }
    },
    PIN: {
      WIDTH: 56,
      HEIGHT: 75,
      IMG: {
        WIDTH: 40,
        HEIGHT: 40
      }
    },
    MAIN_PIN: {
      WIDTH: 75,
      HEIGHT: 94
    }
  };
})();
