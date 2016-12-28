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
  //var interact = require('interact.js');
  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;
  var servoBlock = {};

  servoBlock.svg = function (root) {
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

    servoBlock.testExpression(root);
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

  return servoBlock;
}();
