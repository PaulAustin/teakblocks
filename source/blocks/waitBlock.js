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
  var waitBlock = {};

  waitBlock.keyPadValue = ko.observable(10);

  // Initial setting for blocks of this type.
  waitBlock.defaultSettings = function() {
    // return a new object with settings for the controller.
    return {
      // And the data that goes with that editor.
      data:{ 'duration':10.0 },
      // Indicate what controller is active. This may affect the data format.
    };
  };
  // Wait block - Wait until something happens, it can wait for things other
  // than time, but it is given that time pasing is part of the function.
  waitBlock.svg = function(root, block) {
    var pathd = '';
    pathd =  pb.move(40, 19);
    pathd += pb.vline(-7);
    pathd += pb.arc(19, 340, 1, 1, -12, 4);
    pathd += pb.move(10.6, 16.5);
    pathd += pb.arc(1.3, 300, 0, 0, 2.2, -0.8);
    pathd += pb.line(-7.8, -10.5);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    var data = block.controllerSettings.data.duration;
    var time = svgb.createText('svg-clear block-wait-text block-stencil-fill', 40, 70, data + " ms");
    time.setAttribute('text-anchor', 'middle');
    root.appendChild(time);
    return root;
  };

  waitBlock.configuratorOpen = function(div, block) {
    keypad.openTabs({
      'getValue': function() { return block.controllerSettings.data.duration; },
      'setValue': function(duration) { block.controllerSettings.data.duration = duration; },
      'type':waitBlock,
      'div': div,
      'block': block,
      'min':-100,
      'max':100,
      'suffix':" ms",
      'numArray': ["+50", "+10", "+1", "-50", "-10", "-1", undefined, "<-"],
      'calcLayout': 'simple'
    });
  //  formTools.sliderInteract(div);
    };
    waitBlock.configuratorClose = function(div) {
      keypad.closeTabs({'div': div});
    };

  return waitBlock;
}();
