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
// first created, especially on a touch based device.
var minDim = 20;
tbSelecton.selectionSvg = null;
tbSelecton.currentChain = null;

tbSelecton.init = function(tbe) {
  tbSelecton.tbe = tbe;
  tbSelecton.interactable = interact(".selection-rect")
    .draggable({
      manualStart: true,  // Drag won't start until initiated by code.
      max: Infinity,
      onstart: function(event) {
        // Move the selection rectangle to its initial location.
        tbSelecton.x0 = event.clientX;
        tbSelecton.y0 = event.clientY;
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
        tbSelecton.currentChain = null;
      },
      onend: function() {
        // Remove the selection rectangle
        if(tbSelecton.selectionSvg !== null){
          tbe.svg.removeChild(tbSelecton.selectionSvg);
          tbSelecton.selectionSvg = null;
          tbSelecton.currentChain = null;
        }
      },
      onmove: function (event) {
        // Determine the top left and the width height based on the pointer
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
        // clientX, clientY reflect the current location.
        // clientX0, clientY0 reflect the initial location at start.
        svgb.translateXY(tbSelecton.selectionSvg, left, top);
        svgb.resizeRect(tbSelecton.selectionSvg, width, height);
        let rect = {
          left: left,
          top: top,
          right: left + width,
          bottom: top + height,
        };
        tbSelecton.checkForSelectedBlocks(rect, tbe);
      }
    });
};

tbSelecton.startSelectionBoxDrag = function(event) {

  // If a selection is already under way, ignore a second one. This can happen
  // on touch devices.
  if (tbSelecton.selectionSvg !== null)
    return;

  // Create a selection rectangle and give it a minimum width.
  // place it just above the background so it is behind all blocks.
  var offset = -minDim/2;
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', offset, offset, minDim, minDim, 5);
  tbSelecton.tbe.svg.insertBefore(tbSelecton.selectionSvg, tbSelecton.tbe.background.nextSibling);

  // Start interacting with the rectangle. This give the rectangle the focus
  // for all events until the pointer is let up.
  event.interaction.start({ name: 'drag'}, tbSelecton.interactable,
        tbSelecton.selectionSvg);
 };

 // Adds and removes the class for a selected block based on position and order of selection.
 tbSelecton.checkForSelectedBlocks = function(rect, tbe) {
   var intersecting = [];
      // Take all of the blocks in the selection area and push it to the array.
     tbe.forEachDiagramBlock( function(block) {
       if(tbe.intersectingArea(rect, block.rect) > 0){
         intersecting.push(block);
         var tempBlock = block;
         if(block.isLoopHead()){
           while(tempBlock !== null ){ //&& !tempBlock.isLoopTail()
             intersecting.push(tempBlock);
             tempBlock = tempBlock.next;
           }
         } else if(block.isLoopTail()){
           while(tempBlock !== null && !tempBlock.isLoopHead()){
             intersecting.push(tempBlock);
             tempBlock = tempBlock.prev;
           }
         }
       }
     });

     // If nothing is in the selection area, then clear the intersecting array.
     if(intersecting.length === 0){
       tbSelecton.currentChain = null;
       intersecting = [];
     } else if(tbSelecton.currentChain === null){ // If nothing is in currentChain, then put in the first selected block.
       tbSelecton.currentChain = tbe.findChunkStart(intersecting[0]);
     }
     // If the block is in intersecting array and it is in the currentChain, select it. Otherwise, deselect it.
     tbe.forEachDiagramBlock(function(block) {
       if(intersecting.includes(block) && tbSelecton.currentChain.chainContainsBlock(block)){
         block.markSelected(true); //tbe.intersectingArea(rect, block.rect) > 0
       } else if(block.flowHead !== null && !intersecting.includes(block.flowHead)){
         block.markSelected(false);
       } else if(block.flowHead === null){
         block.markSelected(false);
       }
     });
 };

return tbSelecton;
}();
