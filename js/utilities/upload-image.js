// avatar.js
'use strict';

window.uploadImage = (function () {
  var FILE_TYPES = ['.gif', '.jpg', '.jpeg', '.png'];

  var getFileInfo = function (file) {
    var fileName = file.name.toLowerCase();
    var isImageFile = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });
    return {
      file: file,
      name: fileName,
      isImage: isImageFile,
      getDescription: function () {
        return fileName.replace(/\.[^/.]+$/, '');
      }
    };
  };

  return function (listener, onUploadCallback, dropToDefault) {
    listener.addEventListener('change', function (evt) {
      var target = evt.target;
      if (target.getAttribute('type') !== 'file') {
        return;
      }
      evt.stopPropagation();

      var fileInfo = target.files.length > 0
        ? getFileInfo(target.files[0])
        : null;

      if (fileInfo !== null && fileInfo.isImage) {
        var reader = new FileReader();
        reader.addEventListener('load', function () {
          onUploadCallback(reader.result, fileInfo.getDescription());
        });
        reader.readAsDataURL(fileInfo.file);
      }

      if (typeof dropToDefault !== 'undefined' && dropToDefault === true) {
        target.value = '';
      }
    });
  };
})();
