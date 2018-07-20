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
var log = require('./log.js');
var svgb = require('./svgbuilder.js');
var b = {};

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
    log.trace('cant find style for ', key);
  }
  return def;
};

b.unknownBlock = {
  svg: function(root, block) {
    //var group = svgb.createGroup('', 10, 10);
    //root.appendChild(group);
    var text = svgb.createText('function-text svg-clear', 10, 40, block.name);
    root.appendChild(text);
    return root;
  }
};

b.identityBlock = require('./blocks/identityBlock.js');
b.pictureBlock = require('./blocks/pictureBlock.js');
b.soundBlock = require('./blocks/soundBlock.js');
b.servoBlock = require('./blocks/servoBlock.js');
b.waitBlock = require('./blocks/waitBlock.js');
b.colorStripBlock = require('./blocks/colorStripBlock.js');
var flowBlocks = require('./blocks/flowBlocks.js');
b.loopBlock = flowBlocks.flowBlockHead;  // TODO name change
b.tailBlock = flowBlocks.flowBlockTail;  // TODO name change
b.motorBlock = require('./blocks/motorBlock.js');
b.twoMotorBlock = require('./blocks/twoMotorBlock.js');
b.identityAccelerometerBlock = require('./blocks/identityAccelerometerBlock.js');

b.digitalWriteBlock = {
  svg: function(root) {
    // TODO
    return root;
  }
};

b.analogWriteBlock = {
  // TODO
};

b.serialWriteBlock = {
  // TODO
};

b.I2CWriteBlock = {
  // TODO
};

// Calculator
b.calculatorBlock = {
  svg: function(root) {
    return root;
  }
};
// Binding sources are things that provide values that can be connected to
// actors. Much still TODO :)
b.musicNoteValue = {
  // TODO
};

b.constantValue = {
  // TODO
};

b.rangeValue = {
  // TODO
};

b.acceleromoterValue = {
  // TODO
};

b.timeValue = {
   // TODO
};

b.compassValue = {
  // TODO
};

b.temperatureValue = {
  // TODO
};

b.funcionValue = {
  // TODO
};

b.messageValue = {
  // TODO
// May be globals on the device, or across a mesh.
};

return b;
}();
