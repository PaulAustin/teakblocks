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

var svgb = require('./svgbuilder.js');
var pb = svgb.pathBuilder;
var b = {};

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
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

b.startBlock = require('./blocks/startBlock.js');
b.pictureBlock = require('./blocks/pictureBlock.js');


// - SVG element construcio.
// - HTML sub parts
// - property serialization
// - animation?

// LED color
b.ledColorStripBlock = {
  svg: function(root) {
    return root;
  }
};

// Single motor
b.motorBlock = {
  svg: function(root) {
    // The graphic is a composite concept of a motor/wheel. In many cases
    // students might only see the wheel.
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    root.appendChild(shaft);
    return root;
  }
};

// Two motors. Sometimes its just better to control two at once.
b.twoMotorBlock = {
  svg: function(root) {
    // Motor 1
    var motor = svgb.createCircle('svg-clear block-motor-body', 27, 30, 20);
    root.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 27, 30, 4);
    root.appendChild(shaft);
    motor = svgb.createCircle('svg-clear block-motor-body', 53, 30, 20);
    root.appendChild(motor);
    shaft = svgb.createCircle('svg-clear block-motor-shaft', 53, 30, 4);
    root.appendChild(shaft);
    return root;
  }
};

// Micro servo block
b.microServoBlock = {
  svg: function(root) {
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
    root.appendChild(path);
    return root;
  }
};

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

// Sound block to make a joyful noise.
b.soundBlock = {
  svg: function(root) {
    var pathd = '';
    pathd =  pb.move(20, 25);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    root.appendChild(path);

    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);
    return root;
  }
};

// Wait block - wait until something happens, such as time passing.
b.waitBlock = {
  svg: function(root) {
    var pathd = '';
    pathd =  pb.move(40, 19);
    pathd += pb.vline(-7);
    pathd += pb.arc(19, 340, 1, 1, -12, 4);
    pathd +=  pb.move(10.6, 16.5);
    pathd +=  pb.arc(1.3, 300, 0, 0, 2.2, -0.8);
    pathd +=  pb.line(-7.8, -10.5);
    pathd +=  pb.close();
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    root.appendChild(path);
    return root;
  }
};

// Calculator
b.calculatorBlock = {
  svg: function(root) {
    return root;
  }
};

// Loop
b.loop = {
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
