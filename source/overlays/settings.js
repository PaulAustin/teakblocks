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

module.exports = function(){

  var settings = {};

  settings.applyBackground = function(overlayDom) {

    // Can one div hold all parts? why insert all individually in the overlay?
    // this will simplifiy cleanup.
    var div = document.createElement('div');
    div.setAttribute('class', 'debugBackground');
    div.setAttribute('id', 'debugBackground');

    overlayDom.appendChild(div);

    var exitGroup = document.createElement('div');
    exitGroup.setAttribute('class', 'debugExitGroup');
    exitGroup.setAttribute('id', 'debugExitGroup');

/*
    var exit = document.createElement('div');
    exit.setAttribute('class', 'debug-exit');
    exit.setAttribute('id', 'debug-exit');

    exitGroup.onclick = settings.exit;
    exitGroup.appendChild(exit);
    exitGroup.innerHTML += `<i class="fa fa-times driver-x-debug svg-clear" aria-hidden="true"></i>`;
    overlayDom.appendChild(exitGroup);
*/


    div = document.createElement('div');
    div.setAttribute('id', 'debugWindow');
    div.setAttribute('class', 'debugWindow');
    div.innerHTML = `
      <div class="debug-log" id="debug-log"></div>
    `;
    overlayDom.appendChild(div);
  };

  settings.startOverlay = function(overlayDom){
    settings.applyBackground(overlayDom);
  };

  settings.exit = function() {
    // Can this just be GC'd by javascript.
    var back = document.getElementById('debugBackground');
    back.parentNode.removeChild(back);

    var exit = document.getElementById('debugExitGroup');
    exit.parentNode.removeChild(exit);

    var debugConsole = document.getElementById('debugWindow');
    debugConsole.parentNode.removeChild(debugConsole);
  };

  return settings;
}();
