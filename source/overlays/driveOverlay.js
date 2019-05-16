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
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var conductor = require('./../conductor.js');
  var overlays = require('./overlays.js');
  var dso = require('./deviceScanOverlay.js');
  var vars = require('./../variables.js');
  var dov = {};

  dov.pastRight = 0;
  dov.pastLeft = 0;

  dov.lValue = 0;
  dov.rValue = 0;
  dov.lPastValue = 0;
  dov.rPastValue = 0;

  dov.start = function() {
    dov.buildSlider();
    dov.sendValuesToBot();
  };

  dov.buildSlider = function() {
    // TODO need to upate value as they change
    overlays.overlayDom.innerHTML = `
    <div id='overlayRoot'>
      <svg id='driveOverlay' xmlns="http://www.w3.org/2000/svg"></svg>
    </div>`;

    window.addEventListener("resize", dov.onResize);

    dov.svg = document.getElementById('driveOverlay');
    dov.onResize();
    dov.sliderInteract();
  };

  dov.onResize = function() {
    dov.w = dov.svg.clientWidth;
    dov.h = dov.svg.clientHeight;
    dov.buildSVG();
  };

  dov.buildSVG = function() {
    var t = dov;
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

  dov.moveThumbs = function() {
      var t = dov;

      t.lValue = parseInt(t.lValue, 10);
      if (t.lValue < -100) {
          t.lValue = -100;
      } else if (t.lValue > 100) {
          t.lValue = 100;
      }

      t.rValue = parseInt(t.rValue, 10);
      if (t.rValue < -100) {
          t.rValue = -100;
      } else if (t.rValue > 100) {
          t.rValue = 100;
      }

      var lPx = (t.range * ((t.lValue + 100)/200));
      var rPx = (t.range * ((t.rValue + 100)/200));
      var bottom = t.gtop + t.range + (t.gw/2);

      dov.lThumb.setAttribute('cy', bottom - lPx);
      dov.rThumb.setAttribute('cy', bottom - rPx);

      t.lText.textContent = t.lValue.toString();
      t.rText.textContent = t.rValue.toString();
  };

  dov.thumbEvent = function(event) {
      var t = dov;
      var thumb = event.target.getAttribute('thumb');
      var valPerPy = 200 / t.range;

      if (thumb === 'L') {
        if (event.type === 'dragstart') {
            t.lValueDStart = t.lValue;
        } else if (event.type === 'dragmove') {
            t.lValue = t.lValueDStart + (valPerPy * (event.y0 - event.pageY));
        } else if (event.type === 'dragend') {
            t.lValue = 0;
        }
      } else if (thumb === 'R') {
          if (event.type === 'dragstart') {
              t.rValueDStart = t.rValue;
          } else if (event.type === 'dragmove') {
              t.rValue = t.rValueDStart + (valPerPy * (event.y0 - event.pageY));
          } else if (event.type === 'dragend') {
              t.rValue = 0;
          }
      }
      t.moveThumbs();
  };

  dov.sliderInteract = function() {

    interact('.slider-thumb', {context:dov.svg})              // target the matches of that selector
      .draggable({         // make the element fire drag events
        max: Infinity      // allow drags on multiple elements
      })
      .on('dragstart', function (event) {
          dov.thumbEvent(event);
      })
      .on('dragmove', function (event) {
          dov.thumbEvent(event);
      })
      .on('dragend', function(event) {
          dov.thumbEvent(event);
      });
  };

  dov.sendValuesToBot = function() {
    var id = dso.deviceName;
    var t = dov;

    //    log.trace('updTE', id);
    //var changed = dov.displayLeft !== dov.pastLeft || dov.displayRight !== dov.pastRight;
    if (id !== null && id !== dso.nonName) {
      if (t.lValue !== t.lPastValue) {
        var message2 = '(m:1 d:' + -t.lValue + ' b:1);';
        conductor.cxn.write(id, message2);
      }
      if (t.rValue !== t.rPastValue) {
        var message1 = '(m:2 d:' + -t.rValue + ');';
        conductor.cxn.write(id, message1);
      }

      t.lPastValue = t.lValue;
      t.rPastValue = t.rValue;
    }
/*
    var accel = document.getElementsByClassName("drive-accelerometer")[0];
    accel.innerHTML = "Accelerometer:" + cxn.accelerometer;

    var compass = document.getElementsByClassName("drive-compass")[0];
    compass.innerHTML = "Compass:" + cxn.compass;

    var temp = document.getElementsByClassName("drive-temperature")[0];
    temp.innerHTML = "Temperature:" + cxn.temp;
*/
    dov.timer = setTimeout( function() {
      dov.sendValuesToBot();
    }, 500);
  };

  // Close the dov overlay.
  dov.exit = function() {
    clearTimeout(dov.timer);
  };

  return dov;
}();
