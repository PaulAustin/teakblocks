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

var svgb = require('./svgbuilder.js');

var svgLog = {};
// A tool for adding cosmetic notes to an svg canvas that fade away
// TODO add means for text, controlltimeing of fade, and other things.

// Array of elements in the visual log
svgLog.log  = [];

// Add a rectangle 'comment' to the canvas
svgLog.logRect = function logRect(canvas, rect, text) {

  var group = svgb.createGroup('svglog', rect.left, rect.top);
  group.setAttribute('pointer-events', 'none');

  // Make a bright transparent rectangle
  var elt = svgb.createRect('svglog-rect', 0, 0);
  elt.style.width = rect.right - rect.left;
  elt.style.height = rect.bottom - rect.top;
  elt.setAttribute('fill', 'DeepPink');
  elt.setAttribute('opacity', '0.2');
  elt.setAttribute('pointer-events', 'none');
  group.appendChild(elt);

  // If there is some text add that to the group.
  if (text !== undefined) {
    var textElt =  svgb.createText('svglog-text', 10, 20, text);
    textElt.setAttribute('pointer-events', 'none');
    group.appendChild(textElt);
  }

  canvas.appendChild(group);
  svgLog.log.push({elt: group, canvas: canvas});
  setTimeout(svgLog.cullLog, 100);
};

// Remove old log elements over time so they don't clutter up the display.
svgLog.cullLog = function() {
  var l = svgLog.log.length;
  if (l > 1) {
    var obj = svgLog.log.shift();
    obj.canvas.removeChild(obj.elt);
    setTimeout(svgLog.cullLog, 100);
  }
};

// Clear any remaing elements from the log.
svgLog.clearLog = function() {
  while(svgLog.log.length > 0) {
    var obj = svgLog.log.pop();
    obj.canvas.removeChild(obj.elt);
  }
};

return svgLog;
}();
