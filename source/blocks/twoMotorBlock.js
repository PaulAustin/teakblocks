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
  var svgb = require('./../svgbuilder.js');
  //var formTools = require('./../block-settings.js');
  var keypad = require('./keypadTab.js');
  var ko = require('knockout');
  var pb = svgb.pathBuilder;
  var twoMotorBlock = {};

  twoMotorBlock.keyPadValue = ko.observable(50);
  twoMotorBlock.beatsValue = ko.observable("1 beat");

  // Initial setting for blocks of this type.
  twoMotorBlock.defaultSettings = function() {
    // Return a new object with settings for the controller.
    return {
      data:{
        speed: 50,
        duration: 0,
      },
      // Indicate what controller is active. This may affect the data format.
      controller:'speed',
    };
  };
  // Wait block - Wait until something happens, it can wait for things other
  // than time, but it is given that time pasing is part of the function.
  twoMotorBlock.svg = function(root, block) {
    // Motor 1
    var motor = svgb.createCircle('svg-clear block-motor-body', 27, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 27, 30, 4);
    root.appendChild(shaft);
    motor = svgb.createCircle('svg-clear block-motor-body', 53, 30, 20);
    root.appendChild(motor);
    shaft = svgb.createCircle('svg-clear block-motor-shaft', 53, 30, 4);
    root.appendChild(shaft);

    var data1 = block.controllerSettings.data.speed;
    var rotate = (data1/100)*180;
    var dx = Math.cos((rotate) * (Math.PI/180));
    var dy = Math.sin((rotate) * (Math.PI/180));
    var spread = 1;
    if(rotate < 0){
      spread = 0;
    }
    var pathd = '';
    pathd = pb.move(53, 30);
    pathd += pb.line(0, -20);
    pathd += pb.arc(20, rotate, 0, spread, (dy*20), -((dx*20)-20));
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill-back', pathd);
    root.appendChild(path);
    pathd = '';
    pathd =  pb.move(50, 30);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    path.setAttribute('transform', "rotate(" + rotate + " 53 30)"); //rotate
    root.appendChild(path);

    var data2 = block.controllerSettings.data.duration;
    var textToDisplay = svgb.createGroup('displayText', 0, 0);
    var duration = svgb.createText('svg-clear block-motor-text-duration block-stencil-fill', 40, 70, data2 + " \uf192"); //data2 + " \uf192"
    textToDisplay.appendChild(duration);
    textToDisplay.setAttribute('text-anchor', 'middle');
    root.appendChild(textToDisplay);
    return root;
  };

  twoMotorBlock.configuratorOpen = function(div, block) {
    keypad.openTabsWithBeats({
      'getValue': function() { return block.controllerSettings.data.speed; },
      'setValue': function(speed) { block.controllerSettings.data.speed = speed; },
      'type':twoMotorBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':"%",
      'numArray': ["+10", "<-", "-10", "+50", undefined, "-50"],
      'calcLayout': 'simple',
      'getBeats': function() { return block.controllerSettings.data.duration; },
      'setBeats': function(duration) { block.controllerSettings.data.duration = duration; },
    });
  };
  twoMotorBlock.configuratorClose = function(div) {
    keypad.closeTabs({'div': div});
  };

  return twoMotorBlock;
}();
