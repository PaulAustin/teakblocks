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
  var actionButtons = {};
  var svgb = require('./svgbuilder.js');

  actionButtons.addActionButtons = function(buttons, tbe) {
    var position = null;
    var alignment = null;
    var command = '';
    var tweakx = 0;
    var label = '';
    var numMiddle = 0;
    var toReturn = null;

    var group = null;
    var svgCircle = null;
    var svgText = null;
    var svgText2 = null;
    var existing = document.getElementsByClassName('buttonGroup');

    // If action buttons exist, delete them
    if(existing[0] !== undefined){
      while(existing.length > 0){
          existing[0].parentNode.removeChild(existing[0]);
      }
    }

    // Determine how many buttons are inthe middle
    for (var k = 0; k < buttons.length; k++) {
      if (buttons[k].alignment === 'M' && buttons[k].position > numMiddle) {
        numMiddle = buttons[k].position;
      }
    }

    var half = window.innerWidth/2;
    var middleLeft = half - ((numMiddle + 1) * 0.05 * window.innerWidth);
    var x = 0;

    for (var i = buttons.length - 1; i >= 0; i--) {
      position = buttons[i].position;
      alignment = buttons[i].alignment;
      command = buttons[i].command;
      tweakx = buttons[i].tweakx;
      if (tweakx === undefined) {
        tweakx = 0;
      }
      label = buttons[i].label;

      if (alignment === 'L') {
        x = ((0.1 * window.innerWidth) * position);
      } else if(alignment === 'M') {
        x = middleLeft + ((0.1 * window.innerWidth) * position);
      } else if (alignment === 'R') {
        x = window.innerWidth - ((0.1 * window.innerWidth) * position);
      }

      group = svgb.createGroup('buttonGroup', 0, 0);
      svgCircle = svgb.createCircle('action-dot', x, 40, 33);

      //Check if chatacter strings are more than one character to create a label on top of the usual label
      if(label.length > 1){
        svgText = svgb.createText('action-dot-text', x + tweakx, 53, label.substring(0, 1));
        svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, 53, label.substring(1));
        group.appendChild(svgCircle);
        group.appendChild(svgText);
        group.appendChild(svgText2);
      } else{
        svgText = svgb.createText('action-dot-text', x + tweakx, 53, label);
        group.appendChild(svgCircle);
        group.appendChild(svgText);
      }

      tbe.svg.appendChild(group);
      buttons[i].svgText = svgText;
      buttons[i].svgCircle = svgCircle;
      svgCircle.setAttribute('command', command);

      if (buttons[i].command === 'copyToClipboard') {
        // TODO, abstract it
        var curr = group.getAttribute('class');
        group.setAttribute('class', curr + ' copy-button');
      }
      if(buttons[i].command === 'trashFirst'){
        // TODO, abstract it
        toReturn = [svgCircle, svgText];
      }
    }

    return toReturn;
  };
  return actionButtons;

}();
