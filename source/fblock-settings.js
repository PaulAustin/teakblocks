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
    motor.setAttribute('stroke', '#FFB74D'); //'#454545')
    motor.setAttribute('stroke-width', '2');
    motor.setAttribute('stroke-dasharray', '4, 5');
    root.appendChild(motor);

    var shaft = svgb.createCircle('svg-clear', 40, 30, 4);
    shaft.setAttribute('fill', '#202020');
    root.appendChild(shaft);
    return root;
  }
};

//infoGroup.append("text").attr("class", "svg-icon").text("\uf005");

// sound
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

    //var text = svgb.createText('svg-icon', 10, 45, "\uf026");
    var path = svgb.createPath('svg-clear', pathd);
    path.setAttribute('fill', '#FFB74D');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke', '#FFB74D');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    root.appendChild(path);

    pathd = '';
    pathd =  pb.move(45, 25);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear', pathd);
    soundPath.setAttribute('fill', 'none');
    soundPath.setAttribute('stroke', '#FFB74D');
    soundPath.setAttribute('stroke-width', '2');
    soundPath.setAttribute('stroke-linecap', 'round');
    root.appendChild(soundPath);
    return root;
  }
};

// calculator
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

    var path = svgb.createPath('svg-clear', pathd);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke', '#FFB74D');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    root.appendChild(path);
    return root;
  }
};

// calculator
b.calculatorBlock = {
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
