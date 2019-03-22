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
//  var log = require('./../log.js');
  var overlays = {};

  overlays.currentShowing = null;
  overlays.currentIsClosing = false;

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

  overlays.toggle = function(name) {
    var o = overlays.screens[name];
    overlays.overlayClosing = false;

    var currentOverlay = overlays.currentShowing;
    if (overlays.currentShowing !== null) {
        // If one is up close it (might be toggle action)
        overlays.hideOverlay();
    }
    if (currentOverlay !== o) {
        // If it is a new one then show it.
        o.start();
        overlays.currentShowing = o;
    }
  };

  overlays.hideOverlay = function() {
      if (overlays.currentShowing !== null) {
          overlays.currentIsClosing = true;
          overlays.currentShowing.exit();
          overlays.currentShowing = null;
      }
  };

  overlays.endAnimation = function() {
      console.log("overlay animation done" );
      if (overlays.currentIsClosing === true) {
          overlays.currentIsClosing = false;
      }

  };

  return overlays;
}();
