/*
Copyright (c) 2017 Paul Austin - SDG

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

// An overlay to see log messages and communications
// between the app and hte robot.
module.exports = function () {

  var debugMode = {};
  var ble = require('./../bleConnections.js');
  var app = require('./../appMain.js');

  // External function for putting it all together.
  debugMode.start = function () {

    // Construct the DOM for the overlay.
    app.overlayDom.innerHTML = `
      <div id='debugOverlay' class ='overlaySlideIn'>
        <div id='overlayExitButton'>
          <i class='fa fa-times driver-x-debug svg-clear' aria-hidden='true'></i>
        </div>
        <div id='debugLogBackground'>
          <div id='debugLog'></div>
        </div>
      </div>`;

    var exitButton = document.getElementById('overlayExitButton');
    exitButton.onclick = debugMode.exit;
    debugMode.logElement = document.getElementById('debugLog');

    // Start update function.
    debugMode.updateDebug();
    debugMode.log('> Hello');
  };

  // Add a messge to the log.
  debugMode.log = function (text) {
    debugMode.logElement.innerHTML += text;
    // TODO need way to trim buffer to a max size (10K??)
  };

  // Update the list of messages show in the display.
  debugMode.updateDebug = function() {

    // Erase old text.
    // debugMode.logElement.innerHTML = '';

    // Replace contents with existing list of messages.
    for(var i = 0; i < ble.messages.length; i++) {
      debugMode.log(ble.messages[i] + '\n');
    }

    // Prime the timer again.
    debugMode.timer = setTimeout(function() { debugMode.updateDebug(); }, 2000);
  };

  // Close the overlay.
  debugMode.exit = function() {
    clearTimeout(debugMode.timer);
    var overlay = document.getElementById('debugOverlay');
    if  (overlay !== null) {
      overlay.className = 'overlaySlideOut';
    }

    // For now, leave the element there until the next overlay replaces it.
    // app.overlayDom.innerHTML = '';
  };

  return debugMode;
}();
