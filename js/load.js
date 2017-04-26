// load.js
'use strict';

window.load = (function () {
  var REQUEST_TIMEOUT_IN_MILLISECONDS = 10000;
  var REQUEST_BY_GET_METHOD = 'GET';
  var RESPONSE_OF_JSON_TYPE = 'json';
  var RESPONSE_STATUS_OK = 200;

  return function (url, onLoad, onError) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = RESPONSE_OF_JSON_TYPE;
    xhr.timeout = REQUEST_TIMEOUT_IN_MILLISECONDS;

    xhr.addEventListener('load', function () {
      if (xhr.status === RESPONSE_STATUS_OK) {
        onLoad(xhr.response);
      } else {
        onError('Неизвестный статус: ' + xhr.status + ' ' + xhr.statusText);
      }
    });

    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения.');
    });

    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс.');
    });

    xhr.open(REQUEST_BY_GET_METHOD, url);
    xhr.send();
  };
})();
