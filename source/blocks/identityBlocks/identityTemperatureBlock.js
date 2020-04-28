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
  var svgb = require('svgbuilder.js');
  var fastr = require('fastr.js');
  var keypad = require('./../keypadTab.js');
  var identityTemperatureBlock = {};

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  identityTemperatureBlock.keyPadValue = ko.observable(0);


  // Initial settings for blocks of this type.
  identityTemperatureBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What comparison: =, <, >
        comparison:'>',
        // Value
        value:80
      },
    };
  };

  identityTemperatureBlock.fixLabel = function() {
    var boxContent = document.getElementById('numeric-display').innerHTML;
    console.log(window.origin);
    boxContent = boxContent.slice(0, boxContent.length - 3) + boxContent.slice(boxContent.length - 2, boxContent.length);
    document.getElementById('numeric-display').innerHTML = boxContent;
  };

  identityTemperatureBlock.configuratorOpen = function(div, block) {
    keypad.openTabs(div, {
      'getValue': function() { return block.controllerSettings.data.value; },
      'setValue': function(value) {
         identityTemperatureBlock.fixLabel();
         block.controllerSettings.data.value = value;
       },
      'type':identityTemperatureBlock,
      'block': block,
      'min':20,
      'max':120,
      'suffix':' °F', //˚F
      'numArray': ["-1", "C", "+1", "-10", undefined, "+10"],
      'calcLayout': 'simple',
      'inner': `<div id='keypadDiv' class='editorDiv'>
          <div class="dropdown-label-txt svg-clear">temp
          </div>
          <select class="dropdown-comparison" id="dropdown-comparison">
            <option value=">" id="idTemp-greater">></option>
            <option value="<" id="idTemp-less"><</option>
            <option value="=" id="idTemp-equals">=</option>
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
    identityTemperatureBlock.fixLabel();
  };

  // Close the identity blocks and clean up hooks related to it.
  identityTemperatureBlock.configuratorClose = function(div, block) {
    var comparison = document.getElementById('dropdown-comparison');
    var index = comparison.selectedIndex;
    block.controllerSettings.data.comparison = comparison.options[index].value;
    keypad.closeTabs(div);
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  identityTemperatureBlock.svg = function(root, block) {
    var text = svgb.createText('fa fas svg-clear block-temperature-text block-identity-text', 42, 60, fastr.temp);
    text.setAttribute('text-anchor', 'middle');
    root.appendChild(text);
  };

  return identityTemperatureBlock;
  }();
