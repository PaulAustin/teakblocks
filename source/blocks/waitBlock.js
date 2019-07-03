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
  var keypad = require('./keypadTab.js');

  var waitBlock = {};
  waitBlock.keyPadValue = ko.observable(1);

  // Initial settings for blocks of this type.
  waitBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{ 'duration':1.0 },
      // Indicate what controller is active. This may affect the data format.
    };
  };
  // Wait block - Wait until something happens. It can wait for things other
  // than time, but it is assumed that time passing is part of the function.
  waitBlock.svg = function(root, block) {
    var waitIcon = icons.wait(0.9, 50, 19);
    root.appendChild(waitIcon);

    var data = block.controllerSettings.data.duration;
    var time = svgb.createText('svg-clear block-wait-text block-stencil-fill', 45, 70, data + " \uf192");
    time.setAttribute('text-anchor', 'middle');
    root.appendChild(time);

    return root;
  };

  waitBlock.configuratorOpen = function(div, block) {
    keypad.openTabs(div, {
      'getValue': function() { return block.controllerSettings.data.duration; },
      'setValue': function(duration) { block.controllerSettings.data.duration = duration; },
      'type':waitBlock,
      'block': block,
      'min':1,
      'max':50,
      'suffix':" beats",
      'numArray': ["+1", "C", "-1", "+10", undefined, "-10"],
      'calcLayout': 'simple'
    });
  //  formTools.sliderInteract(div);
    };
    waitBlock.configuratorClose = function(div) {
      keypad.closeTabs(div);
    };

  return waitBlock;
}();
