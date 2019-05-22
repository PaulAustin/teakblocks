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
  var svgb = require('./../svgbuilder.js');
  var interact = require('interact.js');
  var ko = require('knockout');
  var icons = require('./icons.js');
  var printBlock = {};
  var vars = require('./../variables.js');

  // Items for selecting a device from a list.
  //identityAccelerometer.devices = ko.observableArray([]);
  printBlock.keyPadValue = ko.observable(0);

  // Initial settings for blocks of this type.
  printBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        // What to print: var, sensor
        print:'var',
        variable:'A',
        sensor:'accel',
        button:'A',
        // Value
        value:0
      },
    };
  };

  printBlock.configuratorOpen = function(div, block) {
    var data = block.controllerSettings.data;
    printBlock.activeBlock = block;
    div.innerHTML =
        `<div id='printEditorDiv' class='editorDiv'>
          <div class='printBlock-buttons' y="100%">
            <div class='printBlock-option' value='A'><span class="svg-clear">A</span></div>
            <div class='printBlock-option' value='B'><span class="svg-clear">B</span></div>
          </div>
          <div class="vert-line"></div>
          <div id='printBlock-editor'>
          </div>
        </div>`;
    printBlock.loadSlide(data.button, block);

    var selObj = document.getElementById("var-list");
    var opts = selObj.options;
    for (var i = 0; i < opts.length; i++) {
      if (data.print === 'var' && opts[i].value === data.variable) {
        selObj.selectedIndex = i;
        break;
      } else if(data.print === 'sensor' && opts[i].value === data.sensor){
        selObj.selectedIndex = i;
        break;
      }
    }

    interact('.printBlock-option')
      .on('down', function (event) {
        var button = event.srcElement;
        var tabs = document.getElementsByClassName('printBlock-option');
        for(var k = 0; k < tabs.length; k++){
          tabs[k].setAttribute('class', 'printBlock-option');
        }
        button.classList.add('printBlock-selected');
        printBlock.loadSlide(button.getAttribute('value'), block);
      });
  };

  printBlock.loadSlide = function(buttonName, block) {
    var editor = document.getElementById('printBlock-editor');
    var opts = document.getElementsByClassName('printBlock-option');
    for(var i = 0; i < opts.length; i++){
      if(opts[i].getAttribute('value') === buttonName){
        opts[i].setAttribute('class', 'printBlock-option printBlock-selected');
      }
    }
    if(buttonName === 'A'){ // var
      block.controllerSettings.data.print = "var";
      block.controllerSettings.data.button = "A";
      editor.innerHTML = `<select class="dropdown-comparison printBlock-dropdown" id="var-list">
      </select>`;
    } else if(buttonName === 'B'){ //sensor
      block.controllerSettings.data.print = "sensor";
      block.controllerSettings.data.button = "B";
      editor.innerHTML = `<select class="dropdown-comparison printBlock-dropdown" id="var-list">
        <option value="accel">accel</option>
        <option value="temp">temp</option>
      </select>`;
    }

    // Add variables to the drop down.
    var selObj = document.getElementById("var-list");
    vars.addOptions(selObj, block.controllerSettings.data.variable);
  };

  // Close the identity blocks and clean up hooks related to it.
  printBlock.configuratorClose = function(div, block) {
    var selObj = document.getElementById('var-list');
    var opt = vars.getSelected(selObj);
    var data = block.controllerSettings.data;
    if(data.print === 'var'){
      data.variable = opt;
    } else if(data.print === 'sensor'){
      data.sensor = opt;
    }
    block.updateSvg();
    printBlock.activeBlock = null;
  };

  // Buid an SVG for the block that indicates the device name
  // and connection status
  printBlock.svg = function(root, block) {
    var board = icons.pictureNumeric(1, 32, 15);
    board.setAttribute('text-anchor', 'middle');
    root.appendChild(board);

    var print = block.controllerSettings.data.print;
    if(print === 'var'){
      var varData = block.controllerSettings.data.variable;
      var variable = icons.variable(0.5, 32, 52, varData);
      root.appendChild(variable);
    } else if(print === 'sensor'){
      var sensor = block.controllerSettings.data.sensor;
      if(sensor === 'accel'){
        var accel = icons.accelerometer(0.50, 'svg-clear block-stencil-fill', 90, 135);
        root.appendChild(accel);
      } else if (sensor === 'temp'){
        var temp = svgb.createText('svg-clear block-identity-text', 90, 160, '\uf2c9');
        temp.setAttribute('transform', 'scale(0.45)');
        root.appendChild(temp);
      }
    }
  };

  return printBlock;
  }();
