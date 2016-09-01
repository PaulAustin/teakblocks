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

module.exports = function (){

var svgBuilder = {};
svgBuilder.ns = 'http://www.w3.org/2000/svg';
svgBuilder.xlinkns = 'http://www.w3.org/1999/xlink';

svgBuilder.p = {
  // Very simple svg tools for the teak block editor needs.
  move: function (dx, dy) {
    return 'm' + dx + ' ' + dy + ' ';
  },
  hline: function(length) {
    return 'h' + length + ' ';
  },
  vline: function(length) {
    return 'v' + length + ' ';
  },
  arc: function(radius, degrees, large, sweep, dx, dy) {
    var text = 'a' + radius + ' ' + radius + ' ' + degrees;
    text += ' ' + large + ' ' + sweep + ' ' + dx + ' ' + dy + ' ';
    return text;
  },
  close: function() {
    return 'z ';
  }
};

svgBuilder.createUse = function createSymbolUse(elementClass, symbolName) {
  var elt  = document.createElementNS(svgBuilder.ns, 'use');
  elt.setAttribute('class', elementClass);
  elt.setAttributeNS(svgBuilder.xlinkns, 'xlink:href', symbolName);
  return elt;
};

svgBuilder.createRect = function createRect(elementClass, x, y, rxy) {
  var elt  = document.createElementNS(svgBuilder.ns, 'rect');
  elt.setAttribute('class', elementClass);
  elt.style.x = x;
  elt.style.y = y;
  if (rxy !== undefined) {
    elt.setAttribute('rx', rxy);
    elt.setAttribute('ry', rxy);
  }
  return elt;
};

svgBuilder.createGroup = function createGroup(elementClass, x, y) {
  var elt  = document.createElementNS(svgBuilder.ns, 'g');
  elt.setAttribute('class', elementClass);
  elt.setAttribute ('transform', 'translate (' + x + ' ' + y + ')');
  return elt;
};

svgBuilder.createText = function createText(elementClass, x, y, text) {
  var elt  = document.createElementNS(svgBuilder.ns, 'text');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('x', x);
  elt.setAttribute('y', y);
  elt.textContent = text;
  return elt;
};

return svgBuilder;
}();
