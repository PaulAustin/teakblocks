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

module.exports = function () {
  //var log = require('log.js');
  var svgb = require('svgbuilder.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');

  var pb = svgb.pathBuilder;
  var identityGyroBlock = {};

  // Items for selecting a device from a list.
  identityGyroBlock.keyPadValue = ko.observable(0);

  // Initial settings for blocks of this type.
  identityGyroBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: =, <, >
        comparison:'=',
        // Value
        value:0
        //run: "yes"
      },
    };
  };

  identityGyroBlock.configuratorOpen = function(div, block) {
    keypad.openTabs(div, {
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':identityGyroBlock,
      'block': block,
      'min':-2048,
      'max':2048,
      'suffix':"",
      'numArray': ["-10", "C", "+10", "-100", undefined, "+100"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">gyro
          </div>
          <select class="dropdown-comparison" id="dropdown-comparison">
            <option value="=" id="idGyro-equals">=</option>
            <option value=">" id="idGyro-greater">></option>
            <option value="<" id="idGyro-less"><</option>
          </select>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.comparison) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  identityGyroBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs(div);
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityGyroBlock.svg = function(root, block) {
    var pathd = '';
    pathd += pb.move(38, 40);
    pathd += pb.vline(-30);
    pathd += pb.hline(2);
    pathd += pb.vline(30);

    pathd += pb.line(25, 20);
    pathd += pb.line(-1, 1.5);
    pathd += pb.line(-25, -20);

    pathd += pb.line(-25, 20);
    pathd += pb.line(-1, -1.5);
    pathd += pb.line(25, -20);

    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    var button1 = svgb.createCircle('svg-clear block-stencil-fill', 28, 13, 8);
    button1.setAttribute('style', 'transform: rotate(20deg) scale(1, 1.5);');
    root.appendChild(button1);

    var button2 = svgb.createCircle('svg-clear block-stencil-fill', 46, 30, 8);
    button2.setAttribute('style', 'transform: rotate(-20deg) scale(1, 1.5);');
    root.appendChild(button2);

    var button3 = svgb.createCircle('svg-clear block-stencil-fill', 65, -27, 8);
    button3.setAttribute('style', 'transform: rotate(90deg) scale(1, 1.5);');
    root.appendChild(button3);
  };

  return identityGyroBlock;
  }();
