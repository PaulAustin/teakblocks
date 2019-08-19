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
  var icons = require('icons.js');

  var tbot = {};

  tbot.Class = function Tbot(svg, x, y, name) {
    this.svg = svg;
    this.name = name;
    this.buildSvg(x, y);
    this.interact();
  };

  tbot.Class.prototype.buildSvg = function(x, y) {
    // Since the Thumb is a circle the vRange is reduced by the
    // diameter (.e.g. the width) This still look confusing.

    // TODO icon and font block coudl really used a common anchor point.
    // too many tweaks
    this.tbotsvg = icons.tbot(1.0, x, y, this.name);
    this.svg.appendChild(this.tbotsvg);
    // ??? Is there any cleanup needed for each time this is called?
  };

  tbot.Class.prototype.updateSvg = function() {
  };

  tbot.Class.prototype.interact = function() {
    var t = this;
    console.log('tbot interact');
    interact('.tbot-device', {context:this.svg})
      .on('dragstart', function (event) { t.event(event); })
      .on('dragmove', function (event) { t.event(event);  })
      .on('dragend', function(event) { t.event(event); })
      .on('down', function(event) { t.event(event); })
      .on('move', function(event) { t.event(event); });
  };

  tbot.Class.prototype.event = function(event) {
    console.log('tbot event', event.pageY);

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

  return tbot;
}();
