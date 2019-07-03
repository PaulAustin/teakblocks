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
  //var interact = require('interact.js');
  var svgb = require('svgbuilder.js');
  var keypad = require('./keypadTab.js');
  var pb = svgb.pathBuilder;
  var servoBlock = {};
  var ko = require('knockout');

  servoBlock.keyPadValue = ko.observable(0+"%");
  // Initial setting for blocks of this type.
  servoBlock.defaultSettings = function() {
    // Return a new object with settings for the controller
    return {
      // and the data that goes with that editor.
      data:{
        'pos':0
      },
      // Indicate what controller is active. This may affect the data format.
    };
  };

  servoBlock.svg = function (root, block) {
    // servo body
    var box = svgb.createRect('svg-clear block-micro-servo-body', 18, 20, 44, 24, 2.5);
    root.appendChild(box);

    // simple servo arm
    var pathd = '';
    pathd =  pb.move(45, 32);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    // Rotate it according to the block data
    var data = block.controllerSettings.data.pos;
    path.setAttribute('transform', "rotate(" + data + " 48 32)");
    root.appendChild(path);

    var pos = svgb.createText('svg-clear block-servo-text block-stencil-fill', 40, 70, data + "˚");
    pos.setAttribute('text-anchor', 'middle');
    root.appendChild(pos);

    //servoBlock.testExpression(root);
    return root;
  };

  servoBlock.testExpression = function(root) {

    var pathd = '';
    pathd =  pb.move(24, 52);
    pathd += pb.line(-9, 0);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 2.5);
    pathd += pb.line(-9, 2.5);
    pathd += pb.line(9, 0);
    var path = svgb.createPath('svg-clear block-sensor-stencil', pathd);
    root.appendChild(path);

    var circle = svgb.createCircle('svg-clear block-sensor-stencil-value', 19.5, 62, 4);
    root.appendChild(circle);

    circle = svgb.createCircle('svg-clear', 19.5, 62, 1);
    root.appendChild(circle);

    return root;
  };

  servoBlock.configuratorOpen = function(div, block) {
    keypad.openTabs(div, {
      'getValue': function() { return block.controllerSettings.data.pos; },
      'setValue': function(position) { block.controllerSettings.data.pos = position; },
      'type':servoBlock,
      'block': block,
      'min':0,
      'max':180,
      'suffix':"˚",
      'numArray': ["+50", "+10", "+1", "-50", "-10", "-1", undefined, "C"],
      'calcLayout': 'simple'
    });
  };
  servoBlock.configuratorClose = function(div) {
    keypad.closeTabs(div);
  };

  return servoBlock;
}();
