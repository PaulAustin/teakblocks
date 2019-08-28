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
  var cxn = require('./../cxn.js');
  var fastr = require('fastr.js');

  var tbot = {};

  tbot.Class = function Tbot(svg, x, y, name) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.buildSvg(svg);
  };

  tbot.Class.prototype.releaseSvg = function() {
    this.selectionsvg = null;
    this.tbotsvg = null;
    this.cxntext = null;
  };

  tbot.Class.prototype.buildSvg = function(svg) {
    // Since the Thumb is a circle the vRange is reduced by the
    // diameter (.e.g. the width) This still look confusing.

    // TODO icon and font block coudl really used a common anchor point.
    // too many tweaks
    this.svg = svg;

    // Bot's LEDs uses upper case name, so use that in icon as well.
    let upName = this.name.toUpperCase();
    this.tbotsvg = this.svg.appendChild(icons.tbot(1.0, this.x, this.y, upName));

    this.selectionsvg = this.tbotsvg.children[0];
    this.cxntext = this.tbotsvg.children[6];

    this.setConnectionStatus(this.status);
    this.interact();
  };

  tbot.Class.prototype.setLocation = function(x, y) {
    this.x = x;
    this.y = y;
    if (this.tbotsvg !== null) {
      svgb.translateXY(this.tbotsvg, x, y);
    }
    return;
  };

  tbot.Class.prototype.setSelected = function(selected) {

    if (selected) {
      this.selectionsvg.style.display = 'block';
    } else {
      this.selectionsvg.style.display = 'none';
    }
    this.selected = selected;
  };

  tbot.Class.prototype.setConnectionStatus = function(status) {
    this.status = status;
    if (status === cxn.statusEnum.CONNECTED) {
      this.setSelected(true);
      this.cxntext.textContent = fastr.link;
    } else if (status === cxn.statusEnum.CONNECTING) {
      this.setSelected(true);
      this.cxntext.textContent = fastr.sync;
    } else if (status === cxn.statusEnum.BEACON) {
       this.setSelected(false);
       this.cxntext.textContent = '';
    } else if (status === cxn.statusEnum.NOT_THERE) {
      this.setSelected(false);
      this.cxntext.textContent = '';
    }
  };

  tbot.Class.prototype.interact = function() {
    var t = this;
    interact('.tbot', {context:this.tbotsvg})
      .on('down', function(event) { t.event(event); });
  };

  tbot.Class.prototype.event = function(event) {
    if (event.type === 'down') {
      if (typeof this.onclick === 'function') {
        this.onclick(this);
      }
    }
  };

  return tbot;
}();
