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
  var icons = require('./../icons.js');
  // TODO the link type could show up on the icon
  // to indicate how it is connected
  // var faBlueTooth = '\uf294';
  var pb = svgb.pathBuilder;
  var variableAddBlock = {};
  // var variables = require('./../../variables.js');

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  variableAddBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  variableAddBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What variable: A, B, C
        variable:'A',
        incdec: '+',
        // Value
        value:1
      },
    };
  };

  variableAddBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) {
        block.controllerSettings.data.value = value;
        if(block.controllerSettings.data.value === '0') {
          block.controllerSettings.data.incdec = '';
        } else if(block.controllerSettings.data.value < 0) {
          block.controllerSettings.data.incdec = '-';
        } else if(block.controllerSettings.data.value > 0) {
          block.controllerSettings.data.incdec = '+';
        }
        //document.getElementById('varAdd-incdec').innerHTML = block.controllerSettings.data.incdec;
      },
      'type':variableAddBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"",
      'numArray': ["-1", "C", "+1", "-10", undefined, "+10"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <select class="dropdown-comparison vars-dropdown-comparison" id="dropdown-comparison">
            <option value="A" id="idAccel-equals">A</option>
            <option value="B" id="idAccel-greater">B</option>
            <option value="C" id="idAccel-less">C</option>
          </select>
          <div class="dropdown-label-txt varAdd-label-txt svg-clear" id="varAdd-incdec">\uf061
          </div>
          <div id="numeric-display" class = "numeric-display-third svg-clear" width='30px' height='80px' data-bind='text: keyPadValue'>
          </div>
          <svg id="keypadSvg" class='area' width='225px' height='200px' xmlns='http://www.w3.org/2000/svg'></svg>
      </div>`
    });

    var drop = document.getElementById("dropdown-comparison");
    var opts = drop.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === block.controllerSettings.data.variable) {
        drop.selectedIndex = i;
        break;
      }
    }
  };

  // Close the identity blocks and clean up hooks related to it.
  variableAddBlock.configuratorClose = function(div, block) {
    var vars = document.getElementById('dropdown-comparison');
    var index = vars.selectedIndex;
    block.controllerSettings.data.variable = vars.options[index].value;

    block.updateSvg();
    keypad.closeTabs({'div': div});
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  variableAddBlock.svg = function(root, block) {
    var varData = block.controllerSettings.data.variable;
    var variable = icons.variable(0.9, 20, 5, varData);
    root.appendChild(variable);

    var val = block.controllerSettings.data.value;
    var incdec = block.controllerSettings.data.incdec;
    var num = svgb.createText('svg-clear vars-bottom-txt', 45, 71, incdec + ' ' + Math.abs(String(val)));
    num.setAttribute('text-anchor', 'middle');
    root.appendChild(num);
  };

  return variableAddBlock;
  }();
