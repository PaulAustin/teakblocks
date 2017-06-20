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

module.exports = function () {
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pictureBlock = {};

  // Use CSS clases for LED lit state.
  function setPicturePixel(svgPixel, state) {
    if (svgPixel === undefined) {
      return;
    }
    if (state === 1) {
      svgPixel.setAttribute('class', 'svg-clear block-picture-led-on');
    } else {
      svgPixel.setAttribute('class', 'svg-clear block-picture-led-off');
    }
  }

  // Map page XY to index in pixel array.
  function pictureEventToIndex(event) {
    // Offset is experimental not supported on all browsers.
    // var x = Math.floor(event.offsetX / 35);
    // var y = Math.floor(event.offsetY / 35);
    var bb = event.target.parentNode.getBoundingClientRect();
    var x = Math.floor((event.pageX - bb.left) / 35);
    var y = Math.floor((event.pageY - bb.top) / 35);
    if ((x > 4) || (y > 4)) {
      return -1;
    } else {
      return (y * 5) + x;
    }
  }

  // List of HTML snippets used for controller tabs.
  pictureBlock.tabs= {
    //'5x5picture' : '<i class="fa fa-smile-o" aria-hidden="true"></i>',
    //'5x5string'  : 'abc',
    //'5x5movie'   : '<i class="fa fa-film" aria-hidden="true"></i>',
    //'5x5sensor'  : '<i class="fa fa-tachometer" aria-hidden="true"></i>'
  };

  // Initial setting for blocks of this type.
  pictureBlock.defaultSettings = function() {
    // return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data:{pix:[0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0]},
      // Indicate what controller is active. This may affect the data format.
      controller:'5x5picture',
    };
  };

  // Generate and SVG based image for a specific block.
  pictureBlock.svg= function(svg, block) {
    var pix = block.controllerSettings.data.pix;
    var group = svgb.createGroup('svg-clear', 26, 15);
    var box = svgb.createRect('svg-clear block-picture-board', -7, -7, 42, 42, 4);
    group.appendChild(box);
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        var style = '';
        if (pix[ix + (iy * 5)] === 0) {
          style = 'svg-clear block-picture-led-off';
        } else {
          style = 'svg-clear block-picture-led-on';
        }
        var led = svgb.createCircle(style, (ix*7), (iy*7), 3);
        group.appendChild(led);
      }
    }
    svg.appendChild(group);
  };

  // Inject the HTML for the controllers editor.
  // TODO: pass in the controller. That might all move our of this class.
  pictureBlock.configuratorClose = function(div, block) {
    console.log('configurator closing', block);
  };

  pictureBlock.configuratorOpen = function(div, block) {
    div.innerHTML =
        `<div id='pictureEditorDiv' class='editorDiv'>
          <svg id='pictureEditor' width=175px height=175px xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' width=175px height=175px rx=10 ry=10 class='pix-editor block-picture-board'/>
          </svg>
        </div>`;

    // Create a editor state object for the interactions to work with.
    var svg = document.getElementById('pictureEditor');
    var pix = block.controllerSettings.data.pix;
    var pixOn = 0;
    var dindex = 0;
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        // Create each LED and initialize its lit state.
        var led = svgb.createCircle('', 17.5+(ix*35), 17.5+(iy*35), 13);
        setPicturePixel(led, pix[dindex]);
        svg.appendChild(led);
        dindex += 1;
      }
    }

    interact('.pix-editor', {context:svg})
      .on('down', function (event) {
        // Flip brush state based on pixel clicked on, then paint.
        var i = pictureEventToIndex(event);
        if (i >= 0) {
          if (pix[i] === 0) {
            pixOn = 1;
          } else {
            pixOn = 0;
          }
        }
        pix[i] = pixOn;
        setPicturePixel(event.target.parentNode.children[i+1], pix[i]);
        block.updateSvg();
      })
      .on('move', function(event) {
        // Paint pixel based on brush state.
        if (event.interaction.pointerIsDown) {
          //If it's in range and there was an actualy change then paint.
          var i = pictureEventToIndex(event);
          if ((i >= 0) &&  (pix[i] !== pixOn)) {
            pix[i] = pixOn;
            setPicturePixel(event.target.parentNode.children[i+1], pix[i]);
            block.updateSvg();
          }
        }
      });
    return;
  };

  return pictureBlock;
}();
