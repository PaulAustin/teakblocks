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
//  var ko = require('knockout');
var b = {};

b.bind = function(style){
  var key = style + 'Block';
  var def = this[key];
  if (def === undefined) {
    def = this.unknownBlock;
  }
  console.log('block bound to ', key,  def);
  return def;
};

b.unknownBlock = {
  svg: function(root, block) {
    //var group = svgb.createGroup('', 10, 10);
    //root.appendChild(group);
    var text = svgb.createText('function-text svg-clear', 10, 45, block.name);
    root.appendChild(text);
    return root;
  }
};

b.pictureBlock = {
  svg: function(root) {
    var group = svgb.createGroup('svg-clear', 10, 10);
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        var led = svgb.createCircle('svg-clear', 5 + (i*12), 5 + (j*12), 4);
        led.setAttribute('fill', '#F44336');
        //led.setAttribute('pointer-events', 'none');
        // test props to see what color to make the LED
        group.appendChild(led);
      }
    }
    root.appendChild(group);
  },
  html:``,

};
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

// motor
b.motorBlock = {
  svg: function(root, block) {
    var motor = svgb.createCircle('svg-clear', 40, 30, 20);
    motor.setAttribute('fill', '#777777');
    motor.setAttribute('stroke', '#454545');
    motor.setAttribute('stroke-width', '2');
    root.appendChild(motor);

    var shaft = svgb.createCircle('svg-clear', 40, 30, 4);
    shaft.setAttribute('fill', '#202020');
    root.appendChild(shaft);
    return root;
  }
};

// calculator
b.calculator = {
  svg: function(root) {
    return root;
  }
};

// loop - do math
b.loop = {
  svg: function(root) {
    return root;
  }
};

return b;
}();
