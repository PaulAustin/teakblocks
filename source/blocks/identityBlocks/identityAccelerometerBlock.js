/*
Copyright (c) 2018 Trashbots - SDG

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
  //var log = require('./../log.js');
  var svgb = require('./../../svgbuilder.js');
  //var cxn = require('./../cxn.js');
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  var pb = svgb.pathBuilder;
  var identityAccelerometerBlock = {};

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  identityAccelerometerBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  identityAccelerometerBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: =, <, >
        comparison:'=',
        // Value
        value:0
      },
    };
  };

  identityAccelerometerBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':identityAccelerometerBlock,
      'div': div,
      'block': block,
      'min':-2000,
      'max':2000,
      'suffix':"",
      'numArray': ["-10", "C", "+10", "-100", undefined, "+100"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">accel
          </div>
          <select class="dropdown-comparison" id="dropdown-comparison">
            <option value="=" id="idAccel-equals">=</option>
            <option value=">" id="idAccel-greater">></option>
            <option value="<" id="idAccel-less"><</option>
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
  identityAccelerometerBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityAccelerometerBlock.svg = function(root, block) {
    var pathd = '';
    pathd += pb.move(38, 40);
    pathd += pb.vline(-20);
    pathd += pb.hline(-5);
    pathd += pb.line(6, -10);
    pathd += pb.line(6, 10);
    pathd += pb.hline(-5);
    pathd += pb.vline(20);

    pathd += pb.line(15, 10);
    pathd += pb.line(5, -5);
    pathd += pb.line(2, 11);
    pathd += pb.line(-11, -2);
    pathd += pb.line(5, -5);
    pathd += pb.line(-15, -10);

    pathd += pb.move(-3, 0);
    pathd += pb.line(-15, 10);
    pathd += pb.line(5, 5);
    pathd += pb.line(-11, 2);
    pathd += pb.line(2, -11);
    pathd += pb.line(5, 5);
    pathd += pb.line(15, -10);
    /*pathd =  pb.move(40, 10);
    pathd += pb.arc(12, 90, 0, 1, 12, 7);
    pathd += pb.vline(21);
    pathd += pb.hline(-5);
    pathd += pb.line(-7, -4);
    pathd += pb.line(-7, 4);
    pathd += pb.hline(-5);
    pathd += pb.vline(-21);
    pathd += pb.arc(12, 90, 0, 1, 12, -7);
    pathd += pb.close();*/
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    /*pathd = '';
    pathd =  pb.move(45, 45);
    pathd += pb.arc(7, 90, 0, 1, -10, 0);
    pathd += pb.move(15, 7);
    pathd += pb.arc(15, 90, 0, 1, -20, 0);
    pathd += pb.move(25, 7);
    pathd += pb.arc(23, 90, 0, 1, -30, 0);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);*/
  };

  return identityAccelerometerBlock;
  }();
