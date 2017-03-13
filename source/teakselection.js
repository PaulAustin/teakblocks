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

module.exports = function (){

var interact = require('interact.js');
var svgb = require('./svgbuilder.js');
var tbSelecton = {};

tbSelecton.init = function(tbe) {
  tbSelecton.tbe = tbe;
  tbSelecton.interactable = interact(".selection-rect")
    .draggable({
      manualStart: true,  // Drag wont start until initiated by code.
      max: Infinity,
      onstart: function() {
        // Move the selection rectangle to its initial location.
        tbSelecton.x0 = event.clientX;
        tbSelecton.y0 = event.clientY;
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
      },
      onend: function(event) {
        // Remove the selection rectangle
        tbe.svg.removeChild(tbSelecton.selectionSvg);
        tbSelecton.selectionSvg = null;
      },
      onmove: function (event) {
        // Determine the top left and the width height basd on the pointer
        // location.
        var left = 0;
        var top = 0;
        var width = 0;
        var height = 0;
        if (event.clientX < tbSelecton.x0) {
          left = event.clientX;
          width = tbSelecton.x0 - event.clientX;
        } else {
          left = tbSelecton.x0;
          width = event.clientX - tbSelecton.x0;
        }
        if (event.clientY < tbSelecton.y0) {
          top = event.clientY;
          height = tbSelecton.y0 - event.clientY;
        } else {
          top = tbSelecton.y0;
          height = event.clientY - tbSelecton.y0;
        }
        width += 16;
        height += 16;
        // clientX, clientY reflect the current location
        // clientX0, clientY0 reflect the initial location at start.
        svgb.translateXY(tbSelecton.selectionSvg, left, top);
        svgb.resizeRect(tbSelecton.selectionSvg, width, height);
      }
    });
};

tbSelecton.startSelectionBoxDrag = function(event) {
  // Create a selction rectangle and give it a monimum width.
  // place it right on top of the back ground so it is behind all blocks.
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', -8, -8, 16, 16, 5);
  tbSelecton.tbe.svg.insertBefore(tbSelecton.selectionSvg, tbSelecton.tbe.background.nextSibling);

  // start interacting wiht the rectangle. This give the rectangel the focus
  // for all events until the pointer is let up.
  event.interaction.start({ name: 'drag'}, tbSelecton.interactable,
        tbSelecton.selectionSvg);
 };

return tbSelecton;
}();
