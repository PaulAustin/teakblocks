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
  var log = require('log.js');

  var editStyle = {};

  editStyle.setFontSize = function(style, size) {
    style.fontSize = size.toString() + 'px';
  };

  editStyle.setHeight = function(style, h) {
    style.height = h.toString() + 'px';
  };

  editStyle.calcSreenScale = function(w, h) {
    var scale = 1.0;

    // Scaling is pinned roughly 70% to 100%.
    // If the screen is large enough then is stays at 100%
    // once below 70% that its pins a 70%. No pint in making
    // things too small to read to touch.
    if ((h < 500) || (w < 700)) {
      if (h < 350) {
        h = 350;
      }
      if (w < 500) {
        w = 500;
      }
      scale = Math.min((h / 500), (w / 700));
    }
    return scale;
  };

  return editStyle;
}();
