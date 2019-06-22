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
  var conductor = require('./../conductor.js');
  var overlays = require('./overlays.js');
  var dso = require('./deviceScanOverlay.js');
  var slideControl = require('./slideControl.js');
  var dov = {};

  dov.start = function() {
    overlays.overlayDom.innerHTML = `
    <div id='overlayRoot'>
      <svg id='driveOverlay' xmlns="http://www.w3.org/2000/svg"></svg>
    </div>`;

    dov.svg = document.getElementById('driveOverlay');
    dov.lSlide = new slideControl.Class(dov.svg, 'L');
    dov.rSlide = new slideControl.Class(dov.svg, 'R');

    window.addEventListener("resize", dov.onResize);
    dov.onResize();
    dov.sendValuesToBot();
  };

  dov.onResize = function() {
    var t = dov;
    t.w = t.svg.clientWidth;
    t.h = t.svg.clientHeight;

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

    var top = 100 * t.scaleH;
    var width = 120 *  Math.min(t.scaleH, t.scaleW);
    var gwHalf = width / 2;
    var gInsetW = 80 * t.scaleW;
    var fontSize = 48 * t.scaleH;

    t.lSlide.buildSvg(gInsetW + gwHalf, width, top, h, fontSize);
    t.rSlide.buildSvg(w - gInsetW - gwHalf, width, top, h, fontSize);
  };

  dov.sendValuesToBot = function() {
    var id = dso.deviceName;
    var t = dov;

    if (id !== null && id !== dso.nonName) {
      if (t.lSlide.vvalue.hasChanged()) {
        var message2 = '(m:1 d:' + (-t.lSlide.vvalue.value) + ' b:1);';
        conductor.cxn.write(id, message2);
      }
      if (t.rSlide.vvalue.hasChanged()) {
        var message1 = '(m:2 d:' + (-t.rSlide.vvalue.value) + ');';
        conductor.cxn.write(id, message1);
      }
      t.lSlide.vvalue.sync();
      t.rSlide.vvalue.sync();
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
