/*
Copyright (c) 2018 Trashbots - SDG

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
// between the app and the robot.
module.exports = function () {
  var log = require('./../log.js');
  // var cxn = require('./../cxn.js');
  var app = require('./../appMain.js');
  var debugMode = {};

  // External function for putting it all together.
  debugMode.start = function () {

    // Construct the DOM for the overlay.
    app.overlayDom.innerHTML = `
    <div id='overlayRoot' class ='fullScreenSlideIn'>
      <div id='debugOverlay'>
        <div id='debugLogBackground'>
          <div id='debugLog'></div>
        </div>
      </div>
    </div>`;

    debugMode.logElement = document.getElementById('debugLog');

    // Start update function.
    debugMode.updateDebug();
    log.trace('> Show debug overlay');
  };

  // Update the list of messages show in the display.
  debugMode.updateDebug = function() {
    debugMode.logElement.innerHTML = log.buffer;
    // Erase old text.
    // debugMode.logElement.innerHTML = '';
    // Replace contents with existing list of messages.
    // for(var i = 0; i < cxn.messages.length; i++) {
    //    debugMode.log(cxn.messages[i] + '\n');
    // }

    // Prime the timer again.
    debugMode.timer = setTimeout(function() { debugMode.updateDebug(); }, 2000);
  };

  // Close the overlay.
  debugMode.exit = function() {

    clearTimeout(debugMode.timer);
    var overlay = document.getElementById('overlayRoot');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }

    // For now, leave the element there until the next overlay replaces it.
    // app.overlayDom.innerHTML = '';
  };

  return debugMode;
}();
