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
  var interact = require('interact.js');
  var svgb = require('svgbuilder.js');
  var editStyle = require('editStyle.js');
  var icons = require('icons.js');
  var vars = require('./../variables.js');

  var slideControl = {};

  slideControl.Class = function Slider(svg, name) {
    this.svg = svg;
    this.name = name;
    this.vvalue = vars.v[name];
    this.dragStart = 0;
    this.vDomain = 200;
  };

  slideControl.Class.prototype.buildSvg = function(hCenter, width, top, h, scale) {
    // Since the Thumb is a circle the vRange is reduced by the
    // diameter (.e.g. the width) This still look confusing.
    var tRadius = width / 2;
    var gh = h - tRadius - top;
    this.vRange = gh - (tRadius * 2);      // range in pixels
    this.hCenter = hCenter;
    this.top = top;
    this.width = width;
    var fontSize = 48 * scale;
    var fontY = fontSize * 0.80;
    var varY = fontSize * 1.40;
    var tw = tRadius - 15;

    // TODO icon and font block could really use a common anchor point - too many tweaks
    var variable = icons.variable(scale, hCenter-(60 * scale), top - varY, this.name);
    this.svg.appendChild(variable);

    this.text = svgb.createText('slider-text', this.hCenter + (45 * scale), top - fontY, "0");
    editStyle.setFontSize(this.text.style, fontSize);
    this.svg.appendChild(this.text);
    var groove = svgb.createRect('slider-groove', hCenter - tRadius, top, width, gh, tRadius);
    this.svg.appendChild(groove);
    this.thumb = svgb.createCircle('slider-thumb', hCenter, top, tw);
    this.thumb.setAttribute('thumb', this.name);
    this.svg.appendChild(this.thumb);

    // Align thumb and text with current value.
    this.updateSvg();
    // ??? Is there any cleanup needed for each time this is called?
    this.interact();
  };

  slideControl.Class.prototype.updateSvg = function() {
    var tPx = (this.vRange * ((this.vvalue.value + 100)/200));
    var bottom = this.top + this.vRange + (this.width / 2);
    this.thumb.setAttribute('cy', bottom - tPx);
    this.text.textContent = this.vvalue.value.toString();
  };

  slideControl.Class.prototype.interact = function() {
    var t = this;
    interact('.slider-thumb', {context:t.thumb})
      // target the matches of that selector
       // allow drags on multiple elements
      .draggable({ max: Infinity })
      .on('dragstart', function (event) { t.event(event); })
      .on('dragmove', function (event) { t.event(event);  })
      .on('dragend', function(event) { t.event(event); });
  };

  slideControl.Class.prototype.event = function(event) {
    var valPerPy = this.vDomain / this.vRange;
    if (event.type === 'dragstart') {
      this.dragStart = this.vvalue.value;
    } else if (event.type === 'dragmove') {
      this.vvalue.set(this.dragStart + (valPerPy * (event.y0 - event.pageY)));
    } else if (event.type === 'dragend') {
      this.vvalue.set(0);
    }
    this.updateSvg();
  };

  return slideControl;
}();
