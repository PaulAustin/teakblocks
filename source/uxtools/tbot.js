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
    this.selectionsvg = svgb.createRect('tbot-select', x-8, y-7, 135, 135, 3);
    //this.svg.appendChild(this.selectionsvg);

    this.tbotsvg = this.svg.appendChild(icons.tbot(1.0, x, y, this.name));
  };

  tbot.Class.prototype.updateSvg = function() {
  };

  tbot.Class.prototype.setSelected = function(selected) {
    if (selected && !this.selected) {
      this.svg.insertBefore(this.selectionsvg, this.tbotsvg);
    } else if (!selected && this.selected) {
      this.svg.removeChild(this.selectionsvg);
    }
    this.selected = selected;
  };

  tbot.Class.prototype.interact = function() {
    var t = this;
    interact('.tbot-device', {context:this.tbotsvg})
      .on('dragstart', function (event) { t.event(event); })
      .on('dragmove', function (event) { t.event(event);  })
      .on('dragend', function(event) { t.event(event); })
      .on('down', function(event) { t.event(event); })
      .on('move', function(event) { t.event(event); });
  };

  tbot.Class.prototype.event = function(event) {
    if (event.type === 'dragstart') {
    } else if (event.type === 'dragmove') {
    } else if (event.type === 'dragend') {
    } else if (event.type === 'down') {
      this.setSelected(!this.selected);
    }
  };

  return tbot;
}();
