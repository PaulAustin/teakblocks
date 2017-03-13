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
  tbSelecton.selectionSvg = svgb.createRect('selection-rect', 300, 200, 20, 20, 5);
  tbe.svg.appendChild(tbSelecton.selectionSvg);

  tbe.selectionInteractable = interact(".selection-rect")
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
        console.log('selection-rect onstart', event);
      },
      onend: function(event) {
        console.log('selection-rect onend', event);
      },
      onmove: function (event) {
        console.log('selection-rect move', event);
        //var block = thisTbe.elementToBlock(event.target);
        //if (block === null)
        //  return;

        // Move the chain to the new location based on deltas.
        // block.dmove(event.dx, event.dy, true);
      }
    });

 tbSelecton.startSelectionBoxDrag = function(event) {
   console.log('start selection box drag operation', tbSelecton.selectionSvg);
   console.log('interaction', event.interaction);
   console.log('interactable', tbe.selectionInteractable);
   event.interaction.start({ name: 'drag'},
                       tbe.selectionInteractable,
                       tbSelecton.selectionSvg);
 };
};

/*
  interact(".selection-rect")
  .draggable({
     range: Infinity,
     onmove: function (event) {
       console.log('onmove', event.dx, event.dy);
     }
     manualStart: true
    // ,
    // onmove: window.dragMoveListener
  })
  .on('dragmove', function (event) {
    console.log ('selection drag move', event.target);
    /*
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    * /
  });
*/

return tbSelecton;
}();
