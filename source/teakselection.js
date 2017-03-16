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

// The selection region has a minimum dimension so it can be seen when it is
// first created, espicially on a touch based device.
var minDim = 20;

tbSelecton.init = function(tbe) {
  tbSelecton.tbe = tbe;
  tbSelecton.interactable = interact(".selection-rect")
    .draggable({
      manualStart: true,  // Drag wont start until initiated by code.
      max: Infinity,
      onstart: function(event) {
        // Move the selection rectangle to its initial location.
        tbSelecton.x0 = event.clientX;
        tbSelecton.y0 = event.clientY;
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
      },
      onend: function() {
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
        width += minDim;
        height += minDim;
        // clientX, clientY reflect the current location
        // clientX0, clientY0 reflect the initial location at start.
        svgb.translateXY(tbSelecton.selectionSvg, left, top);
        svgb.resizeRect(tbSelecton.selectionSvg, width, height);
        //console.log(left, top, width, height, tbe);
        tbSelecton.checkForSelectedBlocks(left, top, width, height, tbe);
      }
    });
};

tbSelecton.startSelectionBoxDrag = function(event) {
  // Create a selction rectangle and give it a monimum width.
  // place it right on top of the back ground so it is behind all blocks.
  var offset = -minDim/2;
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', offset, offset, minDim, minDim, 5);
  tbSelecton.tbe.svg.insertBefore(tbSelecton.selectionSvg, tbSelecton.tbe.background.nextSibling);

  // start interacting wiht the rectangle. This give the rectangel the focus
  // for all events until the pointer is let up.
  event.interaction.start({ name: 'drag'}, tbSelecton.interactable,
        tbSelecton.selectionSvg);
 };

 // Adds and removes the class for a selected block based on position
 tbSelecton.checkForSelectedBlocks = function(left, top, width, height, tbe) {
   tbe.forEachDiagramBlock( function(block) {
     //console.log(e);
     var right = left + width;
     var bottom = top + height;
     //tbe.intersectingArea(block.rect, e.rect) > 0 doesn't work b/c e.rect does not exist
     if(tbSelecton.selectionIntersectingArea(right, left, top, bottom, block.rect.right, block.rect.left, block.rect.top, block.rect.bottom) > 0) {
        block.svgRect.classList.add('selectedBlock');
     } else {
       block.svgRect.classList.remove('selectedBlock');
     }
   });
 };
 tbSelecton.selectionIntersectingArea = function selectionIntersectingArea(right1, left1, top1, bottom1, right2, left2, top2, bottom2) {
     var x = Math.min(right1, right2) - Math.max(left1, left2);
     if (x < 0 ){
       return 0;
     }
     var y = Math.min(bottom1, bottom2) - Math.max(top1, top2);
     if (y < 0) {
       return 0;
     }
     return x * y;
 };

return tbSelecton;
}();
