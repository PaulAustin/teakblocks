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
  var ko = require('knockout');
  var svgb = require('svgbuilder.js');
  var icons = require('icons.js');
  //var formTools = require('./../block-settings.js');
  var keypad = require('./keypadTab.js');
  var twoMotorBlock = {};

  twoMotorBlock.keyPadValue = ko.observable(100 + "%");
  twoMotorBlock.beatsValue = ko.observable("1 beat");

  // Initial settings for blocks of this type.
  twoMotorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 100,
        duration: 1,
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  // Two Motor block
  twoMotorBlock.svg = function(root, block) {
    // Motor 1
    var motor1 = icons.motor(0.85, 3, 3);
    root.appendChild(motor1);

    var data = block.controllerSettings.data.speed;
    var motor2 = icons.motorWithDial(0.85, 23, 3, data);
    root.appendChild(motor2);

    var data2 = block.controllerSettings.data.duration;
    var textToDisplay = svgb.createGroup('displayText', 0, 0);
    var duration = svgb.createText('svg-clear block-motor-text-duration block-stencil-fill', 45, 70, data2 + " \uf192"); //data2 + " \uf192"
    textToDisplay.appendChild(duration);
    textToDisplay.setAttribute('text-anchor', 'middle');
    root.appendChild(textToDisplay);
    return root;
  };

  twoMotorBlock.configuratorOpen = function(div, block) {
    keypad.tabbedButtons(div, {
      'getValue': function() { return block.controllerSettings.data.speed; },
      'setValue': function(speed) { block.controllerSettings.data.speed = speed; },
      'type': twoMotorBlock,
      'block': block,
      'min': -100,
      'max': 100,
      'suffix': "%",
      'numArray': ["+1", "+10", "+50", "-1", "-10", "-50", undefined, "C"],
      'calcLayout': 'simple',
      'getBeats': function() { return block.controllerSettings.data.duration; },
      'setBeats': function(duration) { block.controllerSettings.data.duration = duration; },
    });
  };
  twoMotorBlock.configuratorClose = function(div) {
    keypad.closeTabs(div);
  };

  return twoMotorBlock;
}();
