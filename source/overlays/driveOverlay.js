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

  var Slide = function Slider(name) {
    this.name = name;
    this.vvalue = vars.v[name];
    this.dragStart = 0;
  };

  Slide.prototype.buildSvg = function(svg, width, hCenter, top, vRange) {
    this.hCenter = hCenter;
    this.vRange = vRange;
    this.top = top;
    this.width = width;
    var t = dov;
    var gwHalf = width / 2;
    var fontY = 70 * t.scaleH;
    var fontSize = 48 * t.scaleH;
    var tw = gwHalf - 15;

    this.text = svgb.createText('slider-text', this.hCenter, fontY, "0");
    this.text.style.fontSize = fontSize.toString() + 'px';
    svg.appendChild(this.text);
    var groove = svgb.createRect('slider-groove', hCenter - gwHalf, top, width, t.gh, gwHalf);
    svg.appendChild(groove);
    this.thumb = svgb.createCircle('slider-thumb', hCenter, top, tw);
    this.thumb.setAttribute('thumb', this.name);
    svg.appendChild(this.thumb);

    // Align with initial value.
    this.updateSvg();
  };

  Slide.prototype.updateSvg = function() {
    var tPx = (this.vRange * ((this.vvalue.value + 100)/200));
    var bottom = this.top + this.vRange + (this.width / 2);
    this.thumb.setAttribute('cy', bottom - tPx);
    this.text.textContent = this.vvalue.value.toString();
  };

  dov.start = function() {
    dov.lSlide = new Slide('L');
    dov.rSlide = new Slide('R');
    dov.buildSliders();
    dov.sendValuesToBot();
  };

  dov.buildSliders = function() {
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

  Slide.prototype.event = function(event) {
    var valPerPy = 200 / this.vRange;
    if (event.type === 'dragstart') {
      this.dragStart = this.vvalue.value;
    } else if (event.type === 'dragmove') {
      this.vvalue.set(this.dragStart + (valPerPy * (event.y0 - event.pageY)));
    } else if (event.type === 'dragend') {
      this.vvalue.set(0);
    }
    this.updateSvg();
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

    var top = 100 * t.scaleH;
    // width
    var width = 120 *  Math.min(t.scaleH, t.scaleW);
    // Since the Thumb is a circle the vRange is reduced by the
    // diameter (.e.g. the width)
    var thumbHeigth = width;
    var gwHalf = width / 2;
    t.gh = h - gwHalf - top;
    var vRange = t.gh - thumbHeigth;      // range in pixels
    var gInsetW = 80 * t.scaleW;

    t.lSlide.buildSvg(t.svg, width, gInsetW + gwHalf, top, vRange);
    t.rSlide.buildSvg(t.svg, width, w - gInsetW - gwHalf, top, vRange);
  };

  dov.dispatchEvent = function(event) {
      var tName = event.target.getAttribute('thumb');
      if (tName === 'L') {
        dov.lSlide.event(event);
      } else if (tName === 'R') {
        dov.rSlide.event(event);
      }
  };

  dov.sliderInteract = function() {

    interact('.slider-thumb', {context:dov.svg})
      // target the matches of that selector
      .draggable({         // make the element fire drag events
        max: Infinity      // allow drags on multiple elements
      })
      .on('dragstart', function (event) {
          dov.dispatchEvent(event);
      })
      .on('dragmove', function (event) {
          dov.dispatchEvent(event);
      })
      .on('dragend', function(event) {
          dov.dispatchEvent(event);
      });
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
