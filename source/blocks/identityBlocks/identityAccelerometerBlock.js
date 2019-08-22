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
  var ko = require('knockout');
  var keypad = require('./../keypadTab.js');
  var icons = require('icons.js');
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
        comparison:'>',
        // Value
        value:0
      },
    };
  };

  identityAccelerometerBlock.configuratorOpen = function(div, block) {
    keypad.openTabs(div, {
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) { block.controllerSettings.data.value = value; },
      'type':identityAccelerometerBlock,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"",
      'numArray': ["-10", "C", "+10", "-50", undefined, "+50"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">accel
          </div>
          <select class="dropdown-comparison" id="comparison-list">
            <option value=">" id="idAccel-greater">></option>
            <option value="<" id="idAccel-less"><</option>
            <option value="=" id="idAccel-equals">=</option>
          </select>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("comparison-list");
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
    var comparison = document.getElementById('comparison-list');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs(div);
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityAccelerometerBlock.svg = function(root) {
    var path = icons.accelerometer(1, 'svg-clear block-stencil-fill', 38, 40);
    root.appendChild(path);
  };

  return identityAccelerometerBlock;
  }();
