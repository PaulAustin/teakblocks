/*
Copyright (c) 2019 Trashbots - SDG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

module.exports = function () {
  var overlays = {};

  overlays.currentShowing = null;
  overlays.currentIsClosing = false;
  overlays.isAnimating = false;
  overlays.afterCommand = null;

  // External function for putting it all together.
  overlays.init = function () {

      overlays.overlayDom = document.getElementById('overlayLayer');
      overlays.overlay = null;

      overlays.overlayDom.addEventListener("webkitAnimationEnd", overlays.endAnimation);
      overlays.overlayDom.addEventListener("animationend", overlays.endAnimation);

      var screens = {};
      screens.driveOverlay = require('./driveOverlay.js');
      screens.debugOverlay = require('./debugOverlay.js');
      screens.deviceScanOverlay = require('./deviceScanOverlay.js');
      screens.fileOverlay = require('./fileOverlay.js');
      screens.settingsOverlay = require('./settings.js');
      screens.splashOverlay = require('./splashOverlay.js');
      overlays.screens = screens;

      return overlays;
  };

  overlays.showOverlay = function(name) {
    if (overlays.currentShowing !== null)
      return;
    var o = overlays.screens[name];
    overlays.currentShowing = name;
    o.start();
    var oroot = document.getElementById('overlayRoot');
    oroot.classList.add('fullScreenSlideIn');
    overlays.isAnimating = true;
  };

  overlays.hideOverlay = function(afterCommand) {
    if (overlays.currentShowing !== null) {
      overlays.currentIsClosing = true;
      overlays.screens[overlays.currentShowing].exit();
      overlays.currentShowing = null;
      overlays.afterCommand = afterCommand;
      var oroot = document.getElementById('overlayRoot');
      if (oroot !== null) {
        oroot.classList.remove('fullScreenSlideIn');
        oroot.classList.add('fullScreenSlideOut');
        overlays.isAnimating = true;
      }
    }
  };

  overlays.endAnimation = function() {
    var afterCommand = overlays.afterCommand;
    overlays.afterCommand = null;
    overlays.isAnimating = false;

    if (overlays.currentIsClosing === true) {
      overlays.currentIsClosing = false;
      overlays.overlayDom.innerHTML = '';
    }
    if (afterCommand !== null) {
      afterCommand();
    }
  };

  overlays.pauseResume = function(active) {
    if (overlays.currentShowing !== null) {
      var pr = overlays.screens[overlays.currentShowing].pauseResume;
      if (typeof pr === 'function') {
        pr(active);
      }
    }
  };

  return overlays;
}();
