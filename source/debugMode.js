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

module.exports = function(){

  var debugMode = {};
  var ble = require('./bleConnections.js');

  debugMode.applyBackground = function(){
    var div = document.createElement('div');
    div.setAttribute('class', 'debugBackground');
    div.setAttribute('id', 'debugBackground');
    var root = document.getElementById('tbe-overlay-mode');
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

  debugMode.startDebug = function(root){
    var div = document.createElement('div');
    div.setAttribute('id', 'debugWindow');
    div.setAttribute('class', 'debugWindow');
    div.innerHTML = `
      <div class="debug-log" id="debug-log"></div>
    `;

    root.appendChild(div);
  };
  debugMode.updateDebug = function() {
    console.log(ble.messages);

    var debugConsole = document.getElementById('debug-log');
    debugConsole.innerHTML = '';

    for(var i = 0; i < ble.messages.length; i++) {
      debugConsole.innerHTML += (ble.messages[i] + '\n');
    }

    debugMode.timer = setTimeout( function() {
      debugMode.updateDebug();
    }
    , 500);
  };

  debugMode.startDebugMode = function(dom, tbe){
    debugMode.tbe = tbe;
    debugMode.applyBackground();
    debugMode.startDebug(dom);
    debugMode.updateDebug();
    // var div = document.createElement('div');
    // exit also
  };

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
