// drag-image.js
'use strict';

window.dragImage = (function () {
  var DATA_TRANSFER_TEXT_TYPE = 'text/plain';
  var HTML_IMG_TAG_NAME = 'img';

  var draggedItem = null;

  var hasData = function (dataTransfer) {
    var types = dataTransfer.types;
    return typeof types !== 'undefined' && types.some(function (type) {
      return type === DATA_TRANSFER_TEXT_TYPE;
    });
  };

  return function (imageContainer, getImageContainerCallback) {
    imageContainer.addEventListener('dragstart', function (dragStartEvt) {
      if (dragStartEvt.target.tagName.toLowerCase() !== HTML_IMG_TAG_NAME) {
        return;
      }
      draggedItem = dragStartEvt.target;
      dragStartEvt.dataTransfer.setData(DATA_TRANSFER_TEXT_TYPE, dragStartEvt.target.alt);
    });

    imageContainer.addEventListener('dragover', function (dragOverEvt) {
      dragOverEvt.preventDefault();
      return false;
    });

    imageContainer.addEventListener('dragenter', function (evt) {
      if (!hasData(evt.dataTransfer)) {
        return;
      }
      var targetContainer = getImageContainerCallback(evt.path);
      if (typeof targetContainer === 'undefined' || targetContainer === null) {
        return;
      }
      evt.preventDefault();

      (function (container) {
        var dragCounter = 1;
        var thisContainer = container;

        var containerDragEnterHandler = function (dragEnterEvt) {
          dragEnterEvt.preventDefault();
          dragEnterEvt.stopPropagation();
          dragCounter++;
        };
        var containerDragLeaveHandler = function (dragLeaveEvt) {
          dragLeaveEvt.preventDefault();
          dragLeaveEvt.stopPropagation();
          dragCounter--;

          if (dragCounter === 0) {
            unsubscribe();
          }
        };
        var containerDropHandler = function (dropEvt) {
          dropEvt.preventDefault();
          dragCounter = 0;
          unsubscribe();

          thisContainer.innerHTML = '';
          thisContainer.appendChild(draggedItem);
          draggedItem = null;
        };
        var subscribe = function () {
          thisContainer.addEventListener('dragenter', containerDragEnterHandler);
          thisContainer.addEventListener('dragleave', containerDragLeaveHandler);
          thisContainer.addEventListener('drop', containerDropHandler);
          thisContainer.style.backgroundColor = 'yellow';
        };
        var unsubscribe = function () {
          thisContainer.removeEventListener('dragenter', containerDragEnterHandler);
          thisContainer.removeEventListener('dragleave', containerDragLeaveHandler);
          thisContainer.removeEventListener('drop', containerDropHandler);
          thisContainer.style.backgroundColor = '';
        };

        subscribe();

      })(targetContainer);
    });
  };
})();
