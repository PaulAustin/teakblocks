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

// Drive mode overlay allows users to diretly control the motors and other IO.
module.exports = function(){
  var log = require('./../log.js');
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var conductor = require('./../conductor.js');
  var overlays = require('./overlays.js');
  var dso = require('./deviceScanOverlay.js');
  var driveMode = {};

  driveMode.pastRight = 0;
  driveMode.pastLeft = 0;

  driveMode.start = function() {
    driveMode.buildSlider();
    driveMode.updateSlider();
  };

  driveMode.buildSlider = function() {
    // TODO need to upate value as they change
    overlays.overlayDom.innerHTML = `
    <div id='overlayRoot'
     <div id='driveOverlay'>
      <svg id='driveOverlaySvgCanvas' xmlns="http://www.w3.org/2000/svg"></svg>
<!--      <div class='slider sliderRight' data-value='0'></div>
      <div class='slider sliderLeft' data-value='0'></div>
      <div id='drive-diagnostics' class='drive-diagnostics'>
      -->

        <!--h1 class='connected-brick svg-clear'>Connected Bot: -?-</h1>
        <h1 class="drive-accelerometer svg-clear">Accelerometer: 100</h1>
        <h1 class="drive-compass svg-clear">Compass: 100</h1>
        <h1 class="drive-temperature svg-clear">Temperature: 100</h1>
        <h1 class="drive-encoderL svg-clear">Left Encoder: 100</h1>
        <h1 class="drive-encoderR svg-clear">Right Encoder: 100</h1-->
      </div>
      </div>
    </div>`
    ;
    window.addEventListener("resize", driveMode.onResize);

    driveMode.svg = document.getElementById('driveOverlaySvgCanvas');
    driveMode.onResize();
    driveMode.sliderInteract();
  };

driveMode.onResize = function() {
    driveMode.w = driveMode.svg.clientWidth;
    driveMode.h = driveMode.svg.clientHeight;
    driveMode.buildSVG();
};

  driveMode.buildSVG = function() {

    var svg = driveMode.svg;
    // Clear out the old.
    while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
    }

    var gtop = 120;
    var ginset = 100;
    var gw = 120;
    var tw = 50;
    var gwHalf = gw / 2;
    var gh = driveMode.h - 100 - gtop;

    var lCenter = ginset + gwHalf;
    var rCenter = driveMode.w - ginset - gwHalf;

    var leftGroove = svgb.createRect('slider-groove', lCenter - gwHalf, gtop, gw, gh, gwHalf);
    var rightGroove = svgb.createRect('slider-groove', rCenter - gwHalf, gtop, gw, gh, gwHalf);
    driveMode.svg.appendChild(leftGroove);
    driveMode.svg.appendChild(rightGroove);

    driveMode.lThumb = svgb.createCircle('slider-thumb', lCenter, gtop, tw);
    driveMode.rThumb = svgb.createCircle('slider-thumb', rCenter, gtop, tw);
    driveMode.svg.appendChild(driveMode.lThumb);
    driveMode.svg.appendChild(driveMode.rThumb);

    // Move thumbs to actual value locations.
    driveMode.moveThumbs();
  };

  driveMode.moveThumbs = function() {
      var gtop = 120;
      var gw = 120;
      var gwHalf = gw / 2;
      var gh = driveMode.h - 100 - gtop;

      var lValue = -100;
      var rValue = 100;

      var range = gh - gw;

      var lPx = (range * ((lValue + 100)/200));
      var rPx = (range * ((rValue + 100)/200));

      driveMode.lThumb.setAttribute('cy', lPx + gtop + gwHalf);
      driveMode.rThumb.setAttribute('cy', rPx + gtop + gwHalf);
  };

  driveMode.sliderInteract = function() {

    interact('.slider-thumb', {context:driveMode.svg})              // target the matches of that selector
//      .origin('self')                     // (0, 0) will be the element's top-left
//      .restrict({drag: 'self'})           // keep the drag within the element
//      .inertia(true)                      // start inertial movement if thrown
      .draggable({                        // make the element fire drag events
        max: Infinity                     // allow drags on multiple elements
      })
      .on('dragmove', function (event) {  // call this function on every move
          console.log("on drag move");
          /*
        var sliderHeight = interact.getElementRect(event.target).height,
            value = event.pageY / sliderHeight;

        event.target.style.paddingTop = (value * 7) + 'em';
        var display = (100 - Math.round((value.toFixed(3)*200)));
        event.target.setAttribute('data-value', display);
        if(event.target.classList.contains('sliderRight')) {
          driveMode.displayRight = display;
        } else if (event.target.classList.contains('sliderLeft')) {
          driveMode.displayLeft = display;
        }
        */
      })
    .on('dragend', function(event){
        /*
      event.target.style.paddingTop = (0.5 * 7) + 'em';
      event.target.setAttribute('data-value', 0);
      if(event.target.classList.contains('sliderRight')) {
    //    driveMode.displayRight = 0;
      } else if (event.target.classList.contains('sliderLeft')) {
    //    driveMode.displayLeft = 0;
      }
      */
    });

    // Allow more thatn one slide to be used at a time (multiple fingers).
    interact.maxInteractions(Infinity);
  };

  driveMode.updateSlider = function() {
    var id = dso.deviceName;
//    log.trace('updTE', id);
    //var changed = driveMode.displayLeft !== driveMode.pastLeft || driveMode.displayRight !== driveMode.pastRight;
    if (id !== null && id !== '-?-') {
      if (driveMode.displayLeft !== undefined && driveMode.displayLeft !== driveMode.pastLeft) {
        var message2 = '(m:1 d:' + -driveMode.displayLeft + ' b:1);';
        conductor.cxn.write(id, message2);
      }
      if (driveMode.displayRight !== undefined && driveMode.displayRight !== driveMode.pastRight) {
        var message1 = '(m:2 d:' + -driveMode.displayRight + ');';
        conductor.cxn.write(id, message1);
      }

      driveMode.pastRight = driveMode.displayRight;
      driveMode.pastLeft = driveMode.displayLeft;
    }
/*
    var accel = document.getElementsByClassName("drive-accelerometer")[0];
    accel.innerHTML = "Accelerometer:" + cxn.accelerometer;

    var compass = document.getElementsByClassName("drive-compass")[0];
    compass.innerHTML = "Compass:" + cxn.compass;

    var temp = document.getElementsByClassName("drive-temperature")[0];
    temp.innerHTML = "Temperature:" + cxn.temp;
*/
    driveMode.timer = setTimeout( function() {
      driveMode.updateSlider();
    }
    , 500);
  };

  // Close the driveMode overlay.
  driveMode.exit = function() {
    clearTimeout(driveMode.timer);
  };

  return driveMode;
}();
