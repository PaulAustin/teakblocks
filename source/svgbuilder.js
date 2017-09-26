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

/** @module svgBuilder */

module.exports = function (){

  /** @class svgBuilder */
var svgBuilder = {};
svgBuilder.ns = 'http://www.w3.org/2000/svg';
svgBuilder.xlinkns = 'http://www.w3.org/1999/xlink';

/**
 * A class for building SVG path descriptions
 */
/** @summary  pathBuilder */
svgBuilder.pathBuilder = {
  //* relative pen relocation with no drawing
  move: function (dx, dy) {
    return 'm' + dx + ' ' + dy + ' ';
  },
  //* realtive horizontal line
  hline: function hline(dx) {
    return 'h' + dx + ' ';
  },
  //* relative vertical line
  vline: function(dy) {
    return 'v' + dy + ' ';
  },
  //* relative straight line
  line: function(dx, dy) {
    return 'l' + dx + ' ' + dy + ' ';
  },
  //* arc path element
  arc: function(radius, degrees, large, sweep, dx, dy) {
    var text = 'a' + radius + ' ' + radius + ' ' + degrees;
    text += ' ' + large + ' ' + sweep + ' ' + dx + ' ' + dy + ' ';
    return text;
  },
  //* path closing
  close: function() {
    return 'z ';
  }
};


/** @function */
svgBuilder.createUse = function createSymbolUse(elementClass, symbolName) {
  var elt  = document.createElementNS(svgBuilder.ns, 'use');
  elt.setAttribute('class', elementClass);
  elt.setAttributeNS(svgBuilder.xlinkns, 'xlink:href', symbolName);
  return elt;
};

svgBuilder.resizeRect = function resizeRect(elt, w, h) {
  elt.setAttribute('width', String(w) + 'px');
  elt.setAttribute('height', String(h) + 'px');
};

svgBuilder.translateXY = function translateXY(elt, x, y) {
  elt.setAttribute('transform', 'translate (' +  String(x) + ' ' + String(y) + ')');
};

svgBuilder.createRect = function createRect(elementClass, x, y, w, h, rxy) {
  var elt  = document.createElementNS(svgBuilder.ns, 'rect');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('x', x);
  elt.setAttribute('y', y);
  this.resizeRect(elt, w, h);
  if (rxy !== undefined) {
    elt.setAttribute('rx', rxy);
    elt.setAttribute('ry', rxy);
  }
  return elt;
};

svgBuilder.createCircle = function creatCircle(elementClass, cx, cy, r) {
  var elt  = document.createElementNS(svgBuilder.ns, 'circle');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('cx', cx);
  elt.setAttribute('cy', cy);
  elt.setAttribute('r', r);
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

svgBuilder.createPath = function createText(elementClass, pathData) {
  var elt = document.createElementNS(svgBuilder.ns, 'path');
  elt.setAttribute('class', elementClass);
  elt.setAttribute('d', pathData);
  return elt;
};

return svgBuilder;
}();
