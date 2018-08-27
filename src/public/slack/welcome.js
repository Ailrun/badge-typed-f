(function welcome(global, request) {
  'use strict';
  var loadings = document.getElementsByClassName('loading');
  var main = document.getElementsByTagName('main')[0];
  var emailInput = document.querySelector('input.email');
  var recaptchaDiv = document.getElementsByClassName('recaptcha')[0];
  var requestButtonDefaultClass = 'request-invite';
  var requestButton = document.getElementsByClassName(requestButtonDefaultClass)[0];

  function onRecaptchaLoad() {
    entry(grecaptcha);
  }
  global.onRecaptchaLoad = onRecaptchaLoad;

  function entry(grecaptcha) {
    attachSubmitListener(grecaptcha);
    removeLoadingIcon();
    var recaptchaWidgetID = renderRecaptcha(grecaptcha);
    displayMain();
  }

  function attachSubmitListener(grecaptcha, recaptchaWidgetID) {
    var body = document.body;
    body.addEventListener('submit', function eventListener(event) {
      event.preventDefault();
      disableButton();
      requestInvitation(grecaptcha, recaptchaWidgetID, function (error, message) {
        if (error) {
          return displayError(error.message);
        }

        body.removeEventListener('submit', eventListener);

        return displayMessage(message);
      });
    });
  }

  function requestInvitation(grecaptcha, recaptchaWidgetID, cb) {
    var email = emailInput.value;
    if (email === '') {
      displayError('Please input your email');
      return;
    }

    var recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetID);
    if (typeof recaptchaResponse !== 'string' ||
        recaptchaResponse === '') {
      displayError('Please pass captcha first');
      return;
    }

    request.post('/slack/invite')
      .send({
        email: email,
        recaptchaResponse: recaptchaResponse,
      })
      .end(function (error, res) {
        if (error) {
          return cb(new Error(res.body.message || 'Server Error'));
        }

        if (res.body.slackLink) {
          window.setTimeout(function () {
            window.location.href = res.body.slackLink;
          }, 1000);
        }

        return cb(null, res.body.message);
      });
  }

  function disableButton() {
    modifyRequestButton({
      className: requestButtonDefaultClass,
      disabled: true,
      message: 'Please wait for a moment...',
    });
  }

  function displayMessage(message) {
    modifyRequestButton({
      className: requestButtonDefaultClass,
      message: message,
    });
  }

  function displayError(message) {
    modifyRequestButton({
      className: requestButton.className + ' error',
      disabled: false,
      message: message,
    });
  }

  function modifyRequestButton(opt) {
    requestButton.className = opt.className;
    requestButton.disabled = opt.disabled;
    requestButton.textContent = opt.message;
  }

  function removeLoadingIcon() {
    [].forEach.call(loadings, (loading) => {
      loading.parentNode.removeChild(loading);
    });
  }

  function renderRecaptcha(grecaptcha) {
    return grecaptcha.render(recaptchaDiv);
  }

  function displayMain() {
    main.style.display = 'block';
  }
})(window, superagent);
