/*
Copyright (c) 2016 Paul Austin - SDG

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

  var driveMode = {};
  var interact = require('interact.js');
  var svgb = require('./svgbuilder.js');

  driveMode.buildSlider = function(root){
    var div = document.createElement('div');
    div.innerHTML = `
    <div class='slider sliderRight'></div>
    <div class='slider sliderLeft'></div>
    `;

    root.appendChild(div);

    driveMode.sliderInteract('slider');
  };
  driveMode.applyBackground = function() {
    var div = document.createElement('div');
    div.setAttribute('class', 'driverBackground');
    div.setAttribute('id', 'driverBackground');
    var root = document.getElementById('tbe-driver-mode');
    root.appendChild(div);

    var exit = document.createElement('div');
    exit.setAttribute('class', 'driver-exit');
    exit.setAttribute('id', 'driver-exit');
    exit.onclick = driveMode.exit;
    root.appendChild(exit);
  };

  driveMode.startDiagnostics = function() {
    console.log('starting diagnostics');
  };

  driveMode.sliderInteract = function sliderInteract(eltClass) {
    interact('.' + eltClass)                   // target the matches of that selector
      .origin('self')                     // (0, 0) will be the element's top-left
      .restrict({drag: 'self'})           // keep the drag within the element
      .inertia(true)                      // start inertial movement if thrown
      .draggable({                        // make the element fire drag events
        max: Infinity                     // allow drags on multiple elements
      })
      .on('dragmove', function (event) {  // call this function on every move
        var sliderHeight = interact.getElementRect(event.target).height,
            value = event.pageY / sliderHeight;

        event.target.style.paddingTop = (value * 36) + '%';
        var display = (100-Math.round((value.toFixed(3)*200)));
        event.target.setAttribute('data-value', display);
      });

    interact.maxInteractions(Infinity);   // Allow multiple interactions
  };

  driveMode.startDriveMode = function(dom) {
    driveMode.applyBackground();
    driveMode.buildSlider(dom);
    driveMode.startDiagnostics();
  };

  driveMode.exit = function() {
    var sliders = document.getElementsByClassName('slider');
    for(var i = 0; i < 2; i++){
      sliders[0].parentNode.removeChild(sliders[0]);
    }

    var diagnostics = document.getElementById('diagnostics');
    console.log('delete ' + diagnostics); // Delete diagnostics

    var back = document.getElementById('driverBackground');
    back.parentNode.removeChild(back);

    var exit = document.getElementById('driver-exit');
    exit.parentNode.removeChild(exit);
  };

  return driveMode;
}();
