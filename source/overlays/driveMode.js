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

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){

  var driveMode = {};
  var interact = require('interact.js');
  var conductor = require('./../conductor.js');
  var app = require('./../appMain.js');

  driveMode.pastRight = 0;
  driveMode.pastLeft = 0;

  driveMode.start = function() {
    driveMode.activeDivice = driveMode.findConnectedDevice();
    driveMode.buildSlider(app.overlayDom);
    driveMode.updateSlider();
  };

  driveMode.buildSlider = function() {
    app.overlayDom.innerHTML = `
    <div id='driverBackground' class='fullScreenSlideIn'>
      <div class='slider sliderRight' data-value='0'></div>
      <div class='slider sliderLeft' data-value='0'></div>
      <div id='drive-diagnostics' class='drive-diagnostics'>
        <h1 class='connected-brick svg-clear'>Connected Bot: -?-</h1>
        <h1 class="drive-accelerometer svg-clear">Accelerometer: 100</h1>
        <h1 class="drive-compass svg-clear">Compass: 100</h1>
        <h1 class="drive-temperature svg-clear">Temperature: 100</h1>
        <h1 class="drive-encoderL svg-clear">Left Encoder: 100</h1>
        <h1 class="drive-encoderR svg-clear">Right Encoder: 100</h1>
      </div>
      <div id='exitGroup' class ='exitGroup'>
        <div id='driver-exit' class ='driver-exit'>
          <i class='fa fa-times driver-x svg-clear' aria-hidden='true'></i>
        </div>
      </div>
      <div id='stopGroup' class='stopGroup'>
        <div id='driver-stop' class='driver-stop' text-anchor='middle'>
          <i class='fa fa-stop driver-stop-icon svg-clear' aria-hidden='true'></i>
        </div>
      </div>
    </div>
    `;

    var exitButton = document.getElementById('exitGroup');
    exitButton.onclick = driveMode.exit;

    // TODO connect the stop button

    driveMode.sliderInteract('slider');
  };

  driveMode.findConnectedDevice = function() {
    var id = null;
    app.tbe.forEachDiagramBlock( function(block){
      if(block.name === 'identity' && block.statusIs(3)){
        id = block.controllerSettings.data.deviceName;
      }
    });
    return id;
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
        var display = (100 - Math.round((value.toFixed(3)*200)));
        event.target.setAttribute('data-value', display);
        //console.log(event.target.classList.contains('sliderRight'));
        if(event.target.classList.contains('sliderRight')) {
          driveMode.displayRight = display;
        } else if (event.target.classList.contains('sliderLeft')) {
          driveMode.displayLeft = display;
        }
        //console.log(driveMode.displayRight, driveMode.displayLeft);
      });

    interact.maxInteractions(Infinity);   // Allow multiple interactions
  };

  driveMode.updateSlider = function() {
    var id = driveMode.activeDivice;
    //var changed = driveMode.displayLeft !== driveMode.pastLeft || driveMode.displayRight !== driveMode.pastRight;
    if (id !== null && id !== '-?-') {
      if (driveMode.displayLeft !== undefined && driveMode.displayLeft !== driveMode.pastLeft) {
        var message2 = '(m:1 d:' + driveMode.displayLeft + ');';
        conductor.ble.write(id, message2);
      }
      if (driveMode.displayRight !== undefined && driveMode.displayRight !== driveMode.pastRight) {
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

  // Close the driveMode overlay.
  driveMode.exit = function() {
    clearTimeout(driveMode.timer);

    var overlay = document.getElementById('driverBackground');
    if  (overlay !== null) {
      overlay.className = 'fullScreenSlideOut';
    }
    // TODO Remove content after it is off the screen. 
    //  app.overlayDom.innerHTML = '';

    // Why load docA ?, it will still be there.
    // TODO add animations
    //app.tbe.loadDoc('docA');
  };

  return driveMode;
}();
