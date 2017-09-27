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
module.exports = function(){

  var debugMode = {};
  var ble = require('./../bleConnections.js');

  // External function for putting it all together.
  debugMode.start = function(dom, tbe) {
    debugMode.tbe = tbe;
    debugMode.applyBackground(dom);
    debugMode.startDebug(dom);
    debugMode.updateDebug();
    // var div = document.createElement('div');
  };

  // Construct the DOM for the overlay.
  debugMode.applyBackground = function(root){
    var div = document.createElement('div');
    div.setAttribute('class', 'debugBackground');
    div.setAttribute('id', 'debugBackground');
    root.appendChild(div);

    var exitGroup = document.createElement('div');
    exitGroup.setAttribute('class', 'debugExitGroup');
    exitGroup.setAttribute('id', 'debugExitGroup');
    var exit = document.createElement('div');
    exit.setAttribute('class', 'debug-exit');
    exit.setAttribute('id', 'debug-exit');
    exitGroup.onclick = debugMode.exit;
    exitGroup.appendChild(exit);
    exitGroup.innerHTML += `<i class="fa fa-times driver-x-debug svg-clear" aria-hidden="true"></i>`;
    root.appendChild(exitGroup);
  };

  // Finialize the DOM and insert it into the main page.
  debugMode.startDebug = function(root){
    var div = document.createElement('div');
    div.setAttribute('id', 'debugWindow');
    div.setAttribute('class', 'debugWindow');
    div.innerHTML = `
      <div class="debug-log" id="debug-log"></div>
    `;
    root.appendChild(div);
  };

  // Update the list of messages show in the display.
  debugMode.updateDebug = function() {
    console.log(ble.messages);

    var debugConsole = document.getElementById('debug-log');

    // Erase old text.
    debugConsole.innerHTML = '';

    // Replace contents with existing list of messages.
    for(var i = 0; i < ble.messages.length; i++) {
      debugConsole.innerHTML += (ble.messages[i] + '\n');
    }

    // Prime the timer again.
    debugMode.timer = setTimeout(function() { debugMode.updateDebug(); }, 500);
  };

  // Close the overlay.
  debugMode.exit = function() {
    clearTimeout(debugMode.timer);

    var back = document.getElementById('debugBackground');
    back.parentNode.removeChild(back);

    var exit = document.getElementById('debugExitGroup');
    exit.parentNode.removeChild(exit);

    var debugConsole = document.getElementById('debugWindow');
    debugConsole.parentNode.removeChild(debugConsole);
  };

  return debugMode;
}();
