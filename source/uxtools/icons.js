/*
Copyright (c) 2019 Trashbots - SDG

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

  var svgb = require('svgbuilder.js');
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

  // A basic smiling tbot icon about 120x120
  icons.tbot = function(scale, x, y, name) {
    var group = svgb.createGroup('tbot', x, y);
    var data = [0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0];
    // Item [0] The selection halo
    group.appendChild(svgb.createRect('tbot-select', -8, -7, 135, 135, 3));
    group.appendChild(svgb.createRect('tbot-device', 12, 0, 96, 120, 3));
    group.appendChild(svgb.createRect('svg-clear tbot-device-head', 22, 0, 76, 50, 0));
    group.appendChild(svgb.createRect('tbot-device-side', 0, 0, 10, 120, 3));
    group.appendChild(svgb.createRect('tbot-device-side', 110, 0, 10, 120, 3));
    // Item [5] The device name
    group.appendChild(svgb.createText('svg-clear tbot-device-name', 60, 85, name));
    // Item [6] The connection status
    group.appendChild(svgb.createText('fas svg-clear tbot-device-name', 60, 110, ''));
    group.appendChild(icons.picture(scale, 45, 10, data));
    return group;
  };

  // A basic smiling 5x5 LED matrix
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

  icons.sound = function(scale, x, y) {
    var group = svgb.createGroup('svg-clear', 0, 0);
    var pathd = '';
    pathd =  pb.move(x, y);
    pathd += pb.hline(9);
    pathd += pb.line(10, -10);
    pathd += pb.vline(30);
    pathd += pb.line(-10, -10);
    pathd += pb.hline(-9);
    pathd += pb.vline(-10);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    group.appendChild(path);

    // Sound wave arcs
    pathd = '';
    pathd =  pb.move(x+25, y);
    pathd += pb.arc(12, 90, 0, 1, 0, 10);
    pathd += pb.move(5, -15);
    pathd += pb.arc(20, 90, 0, 1, 0, 20);
    pathd += pb.move(5, -25);
    pathd += pb.arc(28, 90, 0, 1, 0, 30);
    var soundPath = svgb.createPath('svg-clear block-stencil', pathd);
    soundPath.setAttribute('stroke-linecap', 'round');
    group.appendChild(soundPath);
    group.setAttribute('transform', 'scale(' + scale + ')');
    return group;
  };

  icons.wait = function(scale, x, y) {
    var group = svgb.createGroup('svg-group', 0, 0);
    var pathd = '';
    pathd =  pb.move(x, y);
    pathd += pb.vline(-7);
    pathd += pb.arc(19, 340, 1, 1, -12, 4);
    pathd += pb.move(10.6, 16.5);
    pathd += pb.arc(1.3, 300, 0, 0, 2.2, -0.8);
    pathd += pb.line(-7.8, -10.5);
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil', pathd);
    group.appendChild(path);
    group.setAttribute('transform', 'scale(' + scale + ')');
    return group;
  };

  icons.calcbutton = function(scale, x, y, width, hieght, label, style) {
    var group = svgb.createGroup('', 0, 0);
    var button = svgb.createRect(
      'calc-button ' + style,
       x, y, width, hieght, hieght / 2);
    var text = svgb.createText(
      'svg-clear ' + style + '-text',
       x+(width/2), y + 28, label);
    text.setAttribute('text-anchor', 'middle');
    group.appendChild(button);
    group.appendChild(text);
    return group;
  };

  icons.variable = function(scale, x, y, label) {
    var group = svgb.createGroup('svg-clear', 0, 0);

    var pathd = '';
    pathd += pb.move(11, 5);
    pathd += pb.hline(36);
    pathd += pb.line(7.5, 18);
    pathd += pb.line(-7.5, 18);
    pathd += pb.hline(-36);
    pathd += pb.line(-7.5, -18);
    pathd += pb.line(7, -18);
    pathd += pb.close();

    var path = svgb.createPath('svg-clear vars-poly', pathd);
    group.appendChild(path);

    var text = svgb.createText('svg-clear vars-poly-text', 29, 34, label);
    text.setAttribute('text-anchor', 'middle');
    group.appendChild(text);
    group.setAttribute('style', 'transform: scale(' + scale + ');');

    var positionGroup = svgb.createGroup('svg-clear', x, y);
    positionGroup.appendChild(group)

    return positionGroup;
  };

  icons.motor = function(scale, x, y) {
    var group = svgb.createGroup('svg-clear', 0, 0);
    var motor = svgb.createCircle('svg-clear block-motor-body', 40, 30, 20);
    group.appendChild(motor);
    var shaft = svgb.createCircle('svg-clear block-motor-shaft', 40, 30, 4);
    group.appendChild(shaft);

    if (scale !== 1.0) {
      group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    }
    return group;
  };

  icons.motorWithDial = function(scale, x, y, data) {
    var group = svgb.createGroup('svg-clear', 0, 0);

    var motorBody = icons.motor(1.0, x, y);
    group.appendChild(motorBody);

    var data1 = data;
    var rotate = (data1/100)*180;
    var dx = Math.cos((rotate) * (Math.PI/180));
    var dy = Math.sin((rotate) * (Math.PI/180));
    var spread = 1;
    if (rotate < 0) {
      spread = 0;
    }
    var pathd = '';
    pathd = pb.move(40, 30);
    pathd += pb.line(0, -20);
    pathd += pb.arc(20, rotate, 0, spread, (dy*20), -((dx*20)-20));
    pathd += pb.close();
    var path = svgb.createPath('svg-clear block-stencil-fill-back', pathd);
    group.appendChild(path);
    pathd = '';
    pathd =  pb.move(37, 30);
    pathd +=  pb.line(2.5, -19);
    pathd +=  pb.hline(1);
    pathd +=  pb.line(2.5, 19);
    pathd += pb.arc(3.0, 180, 1, 1, -6, 0);
    pathd +=  pb.close();
    path = svgb.createPath('svg-clear block-stencil-fill', pathd);
    path.setAttribute('transform', "rotate(" + rotate + " 40 30)"); //rotate
    group.appendChild(path);

    group.setAttribute('style', 'transform: translate(' + x + 'px, ' + y + 'px) scale(' + scale + ');');
    return group;
  };

  icons.paletteBlock = function(scale, classes, x, y, block) {
    var width = block.width;
    if (block.name.includes('identity')) {
      return icons.paletteBlockIdentity(scale, classes, x, y, width);
    }
    var pathd = '';
    pathd += pb.move(x, y);
    pathd += pb.hline(width);
    pathd += pb.line(15, 40);
    pathd += pb.line(-15, 40);
    pathd += pb.hline(-width);
    pathd += pb.line(15, -40);
    pathd += pb.line(-15, -40);
    pathd += pb.close();

    var path = svgb.createPath(classes, pathd);
    path.setAttribute('transform', 'scale(' + scale + ')');
    return path;
  };

  icons.paletteBlockIdentity = function(scale, classes, x, y, width) {
    var pathd = '';
    pathd += pb.move(x, y);
    pathd += pb.hline(width);
    pathd += pb.line(15, 40);
    pathd += pb.line(-15, 40);
    pathd += pb.hline(-width);
    pathd += pb.vline(-80);
    pathd += pb.close();

    var path = svgb.createPath(classes, pathd);
    path.setAttribute('transform', 'scale(' + scale + ')');
    return path;
  };

  return icons;
}();
