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

  driveMode.lDrag = 0;
  driveMode.rDrag = 0;
  driveMode.lValue = 0;
  driveMode.rValue = 0;

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
    var t = driveMode;
    // Clear out the old.
    while (t.svg.lastChild) {
        t.svg.removeChild(t.svg.lastChild);
    }

    var w = t.w;
    var h = t.h;
    t.scaleH = 1.0;
    t.scaleW = 1.0;
    if ( w < 500 ) {
        if ( w < 200) {
            w = 200;
        }
        t.scaleW = (w / 500);
    }

    if ( h < 500 ) {
        if ( h < 200) {
            h = 200;
        }
        t.scaleH = (h / 500);
    }

    t.gtop = 100 * t.scaleH;
    t.gw = 120 *  Math.min(t.scaleH, t.scaleW);
    var gwHalf = t.gw / 2;
    t.gh = h - gwHalf - t.gtop;
    t.range = t.gh - t.gw;      // range in pixels

    var fontY = 70 * t.scaleH;
    var fontSize = 48 * t.scaleH;
    var tw = gwHalf - 15;

    var gInsetW = 80 * t.scaleW;
    var lCenter = gInsetW + gwHalf;
    var rCenter = w - gInsetW - gwHalf;

    t.lText = svgb.createText('slider-text', lCenter, fontY, "0");
    t.rText = svgb.createText('slider-text', rCenter, fontY, "0");
    t.lText.style.fontSize = fontSize.toString() + 'px';
    t.rText.style.fontSize = fontSize.toString() + 'px';
    t.svg.appendChild(t.lText);
    t.svg.appendChild(t.rText);

    var leftGroove = svgb.createRect('slider-groove', lCenter - gwHalf, t.gtop, t.gw, t.gh, gwHalf);
    var rightGroove = svgb.createRect('slider-groove', rCenter - gwHalf, t.gtop, t.gw, t.gh, gwHalf);
    t.svg.appendChild(leftGroove);
    t.svg.appendChild(rightGroove);

    t.lThumb = svgb.createCircle('slider-thumb', lCenter, t.gtop, tw);
    t.rThumb = svgb.createCircle('slider-thumb', rCenter, t.gtop, tw);
    t.lThumb.setAttribute('thumb', 'L');
    t.rThumb.setAttribute('thumb', 'R');
    t.svg.appendChild(t.lThumb);
    t.svg.appendChild(t.rThumb);

    // Move thumbs to actual value locations.
    t.moveThumbs();
  };

  driveMode.moveThumbs = function() {
      var t = driveMode;

      if (t.lValue < -100) {
          t.lValue = -100;
      } else if (t.lValue > 100) {
          t.lValue = 100;
      }

      if (t.rValue < -100) {
          t.rValue = -100;
      } else if (t.rValue > 100) {
          t.rValue = 100;
      }

      var lPx = (t.range * ((t.lValue + 100)/200));
      var rPx = (t.range * ((t.rValue + 100)/200));

      driveMode.lThumb.setAttribute('cy', lPx + t.gtop + (t.gw/2));
      driveMode.rThumb.setAttribute('cy', rPx + t.gtop + (t.gw/2));
  };

  driveMode.thumbEvent = function(event) {
      var t = driveMode;
      var thumb = event.target.getAttribute('thumb');
      var valPerPy = 200 / t.range;

      if (thumb === 'L') {
        if (event.type === 'dragstart') {
            t.lValueDStart = t.lValue;
        } else if (event.type === 'dragmove') {
            t.lValue = t.lValueDStart + (valPerPy * (event.pageY - event.y0));
        } else if (event.type === 'dragend') {
            t.lValue = 0;
        }
      } else if (thumb === 'R') {
          if (event.type === 'dragstart') {
              t.rValueDStart = t.rValue;
          } else if (event.type === 'dragmove') {
              t.rValue = t.rValueDStart + (valPerPy * (event.pageY - event.y0));
          } else if (event.type === 'dragend') {
              t.rValue = 0;
          }
      }
      t.moveThumbs();
  };

  driveMode.sliderInteract = function() {

    interact('.slider-thumb', {context:driveMode.svg})              // target the matches of that selector
      .draggable({                        // make the element fire drag events
        max: Infinity                     // allow drags on multiple elements
      })
      .on('dragstart', function (event) {
          driveMode.thumbEvent(event);
      })
      .on('dragmove', function (event) {
          driveMode.thumbEvent(event);

          // call this function on every move
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
    .on('dragend', function(event) {
        driveMode.thumbEvent(event);
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
