(function welcome(global, request) {
  'use strict';
  var loadings = document.getElementsByClassName('loading');
  var main = document.getElementsByTagName('main')[0];

  function onRecaptchaLoad() {
    entry();
  }
  global.onRecaptchaLoad = onRecaptchaLoad;

  function entry() {
    removeLoadingIcon();
    displayMain();
  }

  function removeLoadingIcon() {
    [].forEach.call(loadings, (loading) => {
      loading.parentNode.removeChild(loading);
    });
  }

  function displayMain() {
    main.style.display = 'block';
  }
})(window, superagent);
