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

  var driveMode = {};
  var interact = require('interact.js');
  var conductor = require('./conductor.js');
  driveMode.pastRight = 0;
  driveMode.pastLeft = 0;

  driveMode.buildSlider = function(root) {
    var div = document.createElement('div');
    div.innerHTML = `
    <div class='slider sliderRight' data-value='0'></div>
    <div class='slider sliderLeft' data-value='0'></div>
    `;

    root.appendChild(div);
    driveMode.sliderInteract('slider');
  };

  driveMode.applyBackground = function() {
    var div = document.createElement('div');
    div.setAttribute('class', 'driverBackground');
    div.setAttribute('id', 'driverBackground');
    var root = document.getElementById('tbe-overlay-mode');
    root.appendChild(div);

    var exitGroup = document.createElement('div');
    exitGroup.setAttribute('class', 'exitGroup');
    exitGroup.setAttribute('id', 'exitGroup');
    var exit = document.createElement('div');
    exit.setAttribute('class', 'driver-exit');
    exit.setAttribute('id', 'driver-exit');
    exitGroup.onclick = driveMode.exit;
    exitGroup.appendChild(exit);
    exitGroup.innerHTML += `<i class="fa fa-times driver-x svg-clear" aria-hidden="true"></i>`;
    root.appendChild(exitGroup);
  };

  // Diagnostics include the text display in the center of the page.
  driveMode.startDiagnostics = function() {
    console.log('starting diagnostics');

    var div = document.createElement('div');
    div.setAttribute('class', 'drive-diagnostics');
    div.setAttribute('id', 'drive-diagnostics');
    div.setAttribute('text-anchor', 'middle');
    var id = null;
    // Look through the blocks on the edit page
    // to find a start block thath is connected.
    driveMode.tbe.forEachDiagramBlock( function(block){
      if(block.name === 'identity' && block.statusIs(3)){
        id = block.controllerSettings.data.deviceName;
      }
    });
    if(id === null){
      id = '-?-';
    }
    div.innerHTML = `
        <h1 class="connected-brick svg-clear">Connected Bot: ` + id + `</h1>
        <!--h1 class="drive-accelerometer svg-clear">Accelerometer: 100</h1>
        <h1 class="drive-compass svg-clear">Compass: 100</h1>
        <h1 class="drive-temperature svg-clear">Temperature: 100</h1>
        <h1 class="drive-encoderL svg-clear">Left Encoder: 100</h1>
        <h1 class="drive-encoderR svg-clear">Right Encoder: 100</h1-->
    `;
    // Insert the diagnostics div into the overlay mode div.
    var root = document.getElementById('tbe-overlay-mode');
    root.appendChild(div);
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

        event.target.style.paddingTop = (value * 7) + 'em';
        var display = (100-Math.round((value.toFixed(3)*200)));
        event.target.setAttribute('data-value', display);
        //console.log(event.target.classList.contains('sliderRight'));
        if(event.target.classList.contains('sliderRight')){
          driveMode.displayRight = display;
        } else if(event.target.classList.contains('sliderLeft')){
          driveMode.displayLeft = display;
        }
        //console.log(driveMode.displayRight, driveMode.displayLeft);
      });

    interact.maxInteractions(Infinity);   // Allow multiple interactions
  };

  driveMode.updateSlider = function() {
    var id = null;
    driveMode.tbe.forEachDiagramBlock( function(block){
      if(block.name === 'identity' && block.statusIs(3)){
        id = block.controllerSettings.data.deviceName;
      }
    });
    //var changed = driveMode.displayLeft !== driveMode.pastLeft || driveMode.displayRight !== driveMode.pastRight;
    if(id !== null && id !== '-?-') {
      if(driveMode.displayLeft !== undefined && driveMode.displayLeft !== driveMode.pastLeft){
        var message2 = '(m:1 d:' + driveMode.displayLeft + ');';
        conductor.ble.write(id, message2);
      }
      if(driveMode.displayRight !== undefined && driveMode.displayRight !== driveMode.pastRight){
        var message1 = '(m:2 d:' + driveMode.displayRight + ');';
        conductor.ble.write(id, message1);
      }

      driveMode.pastRight = driveMode.displayRight;
      driveMode.pastLeft = driveMode.displayLeft;
    }
    driveMode.timer = setTimeout( function() {
      driveMode.updateSlider();
    }
    , 500);
  };

  driveMode.startDriveMode = function(dom, tbe) {
    driveMode.tbe = tbe;
    driveMode.applyBackground();
    driveMode.buildSlider(dom);
    driveMode.startDiagnostics();
    driveMode.updateSlider();
  };

  driveMode.exit = function() {
    clearTimeout(driveMode.timer);
    var sliders = document.getElementsByClassName('slider');
    for(var i = 0; i < 2; i++){
      sliders[0].parentNode.removeChild(sliders[0]);
    }

    var diagnostics = document.getElementById('drive-diagnostics');
    diagnostics.parentNode.removeChild(diagnostics); // Delete diagnostics

    var back = document.getElementById('driverBackground');
    back.parentNode.removeChild(back);

    var exit = document.getElementById('exitGroup');
    exit.parentNode.removeChild(exit);

    driveMode.tbe.loadDoc('docA');
  };

  return driveMode;
}();
