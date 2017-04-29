// settings.js
'use strict';

window.settings = (function () {
  return {
    advertOffer: {
      type: {
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
      }
    },
    noticeForm: {
      address: {
        format: 'x: {{0}}, y: {{1}}',
        parseXPattern: /x: (\d+)/,
        parseYPattern: /y: (\d+)/
      }
    },
    advertMap: {
      unknownLocation: {
        x: null,
        y: null
      },
      pinPanel: {
        boundingBox: {
          x0: 300,
          x1: 1150,
          y0: 175,
          y1: 630
        }
      },
      mainPin: {
        width: 75,
        height: 94
      },
      otherPin: {
        width: 56,
        height: 75,
        img: {
          width: 40,
          height: 40
        }
      }
    }
  };
})();
