// settings.js
'use strict';

window.defaultSettings = (function () {
  return {
    advert: {
      offer: {
        type: {
          kinds: [
            'flat',
            'house',
            'bungalo'
          ],
          labels: {
            flat: 'Квартира',
            house: 'Дом',
            bungalo: 'Бунгало'
          }
        },
        formats: {
          address: '{{0}}, {{1}}',
          price: '{{0}}&#x20bd;/ночь',
          roomsAndGuests: 'Для {{0}} гостей в {{1}} комнатах',
          checkTime: 'Заезд после {{0}}, выезд до {{1}}'
        },
        titles: [
          'Большая уютная квартира',
          'Маленькая неуютная квартира',
          'Огромный прекрасный дворец',
          'Маленький ужасный дворец',
          'Красивый гостевой домик',
          'Некрасивый негостеприимный домик',
          'Уютное бунгало далеко от моря',
          'Неуютное бунгало по колено в воде'
        ],
        checkTime: [
          '12:00',
          '13:00',
          '14:00'
        ],
        features: [
          'wifi',
          'dishwasher',
          'parking',
          'washer',
          'elevator',
          'conditioner'
        ],
        price: {
          min: 1000,
          max: 1000000
        },
        room: {
          count: {
            min: 1,
            max: 5
          }
        },
        guest: {
          count: {
            min: 1,
            max: 10
          }
        }
      },
      author: {
        avatar: {
          formats: {
            url: 'img/avatars/user{{0}}.png'
          }
        }
      }
    },
    otherPin: {
      width: 56,
      height: 75,
      img: {
        width: 40,
        height: 40
      }
    },
    mainPin: {
      width: 75,
      height: 94
    },
    noticeForm: {
      address: {
        format: 'x: {{0}}, y: {{1}}',
        parseXPattern: /x: (\d+)/,
        parseYPattern: /y: (\d+)/
      }
    },
    map: {
      pinPanel: {
        boundingBox: {
          x0: 300,
          x1: 900,
          y0: 175,
          y1: 500
        }
      }
    }
  };
})();
