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

  var icons = {};

  var svgb = require('./../svgbuilder.js');
  var pb = svgb.pathBuilder;

  icons.accelerometer = function(scale, classes, x, y) {
    var pathd = '';
    pathd += pb.move(x, y);
    pathd += pb.vline(-20);
    pathd += pb.hline(-5);
    pathd += pb.line(6, -10);
    pathd += pb.line(6, 10);
    pathd += pb.hline(-5);
    pathd += pb.vline(20);

    pathd += pb.line(15, 10);
    pathd += pb.line(5, -5);
    pathd += pb.line(2, 11);
    pathd += pb.line(-11, -2);
    pathd += pb.line(5, -5);
    pathd += pb.line(-15, -10);

    pathd += pb.move(-3, 0);
    pathd += pb.line(-15, 10);
    pathd += pb.line(5, 5);
    pathd += pb.line(-11, 2);
    pathd += pb.line(2, -11);
    pathd += pb.line(5, 5);
    pathd += pb.line(15, -10);

    var path = svgb.createPath(classes, pathd);
    path.setAttribute('transform', 'scale(' + scale + ')');
    return path;
  };

  icons.pictureNumeric = function(scale, x, y) {
    var data = [0,0,1,0,0, 0,1,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0];
    var board = icons.picture(scale, x, y, data);
    return board;
  };

  icons.pictureSmile = function(scale, x, y) {
    var data = [0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0];
    var board = icons.picture(scale, x, y, data);
    return board;
  };

  icons.picture = function(scale, x, y, data) {
    var pix = data;
    var group = svgb.createGroup('svg-clear', 26+x, 15+y);
    var box = svgb.createRect('svg-clear block-picture-board', x-7, y-7, 42, 42, 4);
    group.appendChild(box);
    for (var iy = 0; iy < 5; iy++) {
      for (var ix = 0; ix < 5; ix++) {
        var style = '';
        if (pix[ix + (iy * 5)] === 0) {
          style = 'svg-clear block-picture-led-off';
        } else {
          style = 'svg-clear block-picture-led-on';
        }
        var led = svgb.createCircle(style, x+(ix*7), y+(iy*7), 3);
        group.appendChild(led);
      }
    }
    group.setAttribute('transform', 'scale(' + scale + ')');
    return group;
  };

  icons.variable = function(scale, x, y, data) {
    var group = svgb.createGroup('svg-clear', 0, 0);
    var buttonFront = svgb.createRect('svg-clear vars-back-fill', 30, -26, 40, 40, 6);
    group.appendChild(buttonFront);

    var buttonBack = svgb.createRect('svg-clear vars-front-fill', 35, -21, 30, 30, 6);
    group.appendChild(buttonBack);

    var variable = data;
    var text = svgb.createText('svg-clear vars-var-text', 40, 40, variable);
    text.setAttribute('text-anchor', 'middle');
    group.appendChild(text);

    group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    return group;
  };

  return icons;
}();
