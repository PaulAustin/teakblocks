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

module.exports = function () {
  var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;
  var soundBlock = {};

  // List of HTML snippets used for controller tabs.
  soundBlock.tabs= {
    'pianoKeyboard' : '<i class="fa fa-music" aria-hidden="true"></i>'
  };

  // Initial setting for blocks of this type.
  soundBlock.defaultSettings= function() {
    // return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data:{'note':'c4', 'period':'1/4'},
      // Indicate what controller is active. This may affect the data format.
      controller:'pianoKeyboard',
    };
  };

  soundBlock.configurator= function(div) {
    div.innerHTML =
        `<div id='pictureEditorDiv'>
          <br>
          <svg id='pianoSvg'width=210px height=95px xmlns='http://www.w3.org/2000/svg'>
            <rect id='pictureRect' width=209px height=95px rx=4 ry=4 class='block-sound-piano'/>
          </svg>
        </div>`;

    // Create a editor state object for the interactions to work with.
    var svg = document.getElementById('pianoSvg');
  //  var data = block.controllerSettings.data;

    // Create a editor state object for the interactions to work with.
    for (var iwKey = 0; iwKey < 8; iwKey++) {
      var wkey = svgb.createRect('piano-key block-sound-piano-w', 5+(iwKey*25), 13, 24, 78, 3);
      wkey.setAttribute('key', iwKey.toString());
      svg.appendChild(wkey);
    }
    for (var ibKey = 0; ibKey < 7; ibKey++) {
      if (ibKey !== 2 && ibKey !== 6) {
        var bkey = svgb.createRect('piano-key block-sound-piano-b', 20+(ibKey*25), 13, 18, 43, 3);
        svg.appendChild(bkey);
      }
    }
    var r = svgb.createRect('svg-clear block-sound-piano', 0, 0, 209, 14, 4);
    svg.appendChild(r);
/* still some work to do http-server
    interact('.piano-key ', {context:svg})
    .on('down', function (event) {
      var key = event.target.getAttribute('key');
      console.log('key down', key);
      event.target.setAttribute('class', 'piano-key block-sound-piano-w-pressed');
    })
    .on('move', function (event) {
      if (event.interaction.pointerIsDown) {
        var key = event.target.getAttribute('key');
        event.target.setAttribute('class', 'piano-key block-sound-piano-w-pressed');
        console.log('key play', key);
      } else {
        event.target.setAttribute('class', 'piano-key block-sound-piano-w');
        // move stuff
      }
    })
    .on('up', function (event) {
      var key = event.target.getAttribute('key');
      event.target.setAttribute('class', 'piano-key block-sound-piano-w');
      console.log('key up', key);
    });
    */
  };

  // Sound block to make a joyful noise.
  soundBlock.svg = function(root) {
    var pathd = '';
    pathd =  pb.move(20, 25);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);
    return root;
  };

  return soundBlock;
}();
