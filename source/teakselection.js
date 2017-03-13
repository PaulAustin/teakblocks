/*
Copyright (c) 2016 Paul Austin - SDG

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
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', 0, 0, 20, 20, 5);
  tbe.svg.appendChild(tbSelecton.selectionSvg);

  tbSelecton.interactable = interact(".selection-rect")
    .draggable({
      manualStart: true,  // Drag wont start until initiated by code.
      restrict: {
          restriction: tbe.svg,
          endOnly: true,
          // Restrictions, by default, are for the point not the whole object
          // so R and B are 1.x to inlcude the width and height of the object.
          // 'Coordinates' are percent of width and height.
          elementRect: { left: -0.2, top: -0.2, right: 1.2, bottom: 1.2 },
        },
      inertia: {
        resistance: 20,
        minSpeed: 50,
        endSpeed: 1
      },
      max: Infinity,
      onstart: function() {
        console.log('selection-rect onstart', event.clientX, event.clientY);
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
      },
      onend: function(event) {
        console.log('selection-rect onend', event.clientX, event.clientY);
      },
      onmove: function (event) {
        // clientX, clientY reflect the current location
        // clientX0, clientY0 reflect the initial location at start.
        console.log('selection-rect move', event.clientX, event.clientY);
        svgb.translateXY(tbSelecton.selectionSvg, event.clientX, event.clientY);
      }
    });
};

tbSelecton.startSelectionBoxDrag = function(event) {
   console.log('start selection box drag operation');
   event.interaction.start({ name: 'drag'}, tbSelecton.interactable,
        tbSelecton.selectionSvg);
 };

return tbSelecton;
}();
