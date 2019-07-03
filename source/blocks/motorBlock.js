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
  var svgb = require('svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var icons = require('icons.js');
  //var formTools = require('./../block-settings.js');
  var pb = svgb.pathBuilder;
  var motorBlock = {};
  motorBlock.tabs = {
    //'speed': '<i class="fa fa-tachometer" aria-hidden="true"></i>',
    //'duration': '<i class="fa fa-clock-o" aria-hidden="true"></i>',
    '1': '1',
    '2': '2'
  };
  motorBlock.keyPadValue = ko.observable(100 + "%");
  motorBlock.beatsValue = ko.observable("1 beat");
  // Initial setting for blocks of this type.
  motorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 100,
        duration: 1,
        motor: '1'
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  // Wait block - Wait until something happens, it can wait for things other
  // than time, but it is given that time pasing is part of the function.
  motorBlock.svg = function(root, block) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var data = block.controllerSettings.data.speed;
    var motor = icons.motorWithDial(1, 5, 0, data);
    root.appendChild(motor);

    var data2 = block.controllerSettings.data.duration;
    var textToDisplay = svgb.createGroup('displayText', 0, 0);
    var duration = svgb.createText('svg-clear block-motor-text-duration block-stencil-fill', 45, 70, data2 + " \uf192"); //data2 + " \uf192"
    textToDisplay.appendChild(duration);
    textToDisplay.setAttribute('text-anchor', 'middle');
    root.appendChild(textToDisplay);
    return root;
  };
  motorBlock.configuratorOpen = function(div, block) {
    var tabs = document.getElementsByClassName('block-settings-tab');
    for(var i = 0; i < tabs.length; i++){
      if(tabs[i].textContent === block.controllerSettings.data.motor){
        tabs[i].classList.add('tab-selected');
      }
    }
    keypad.tabbedButtons(div, {
      'getValue': function() { return block.controllerSettings.data.speed; },
      'setValue': function(speed) { block.controllerSettings.data.speed = speed; },
      'type':motorBlock,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':" %",
      'numArray': ["+1", "+10", "+50", "-1", "-10", "-50", undefined, "C"],
      'calcLayout': 'simple',
      'getBeats': function() { return block.controllerSettings.data.duration; },
      'setBeats': function(duration) { block.controllerSettings.data.duration = duration; },
    });
  };
  motorBlock.configuratorClose = function(div, block) {
    var tabs = document.getElementsByClassName('block-settings-tab');
    for(var i = 0; i < tabs.length; i++){
      if(tabs[i].classList.contains('tab-selected')){
        block.controllerSettings.data.motor = tabs[i].textContent;
      }
    }
    keypad.closeTabs(div);
  };

  return motorBlock;
}();
