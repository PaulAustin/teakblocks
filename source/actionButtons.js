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
    var toReturn = [];

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
      } else if (buttons[i].command === 'dropdown') {
        // TODO, abstract it
        group.setAttribute('id', 'dropdown');
      }

      toReturn[buttons.length - i - 1] = [svgCircle, svgText];

    }
    for(var j = 0; j < toReturn.length; j++){
      if(toReturn[j][0].getAttribute('command') === "trashFirst"){
        tbe.deleteRay = toReturn[j];
      }
    }
    var underlay = document.getElementsByClassName('action-dot-underlay');
    console.log(underlay);
    if(underlay[0] !== undefined){
      //console.log(underlay[0]);
      //console.log(underlay[1]);
      underlay[0].setAttribute('transform', 'translate (0 0)');
      var animateSlide = {
        frame: 20,
        adx: 0,
        ady: 0
      };
      this.slideButton(animateSlide, underlay[0], "delete");
      /*underlay[1].setAttribute('transform', 'translate (0 0)');
      animateSlide = {
        frame: 20,
        adx: 0,
        ady: 0
      };
      this.slideButton(animateSlide, underlay[1], "delete");*/
    }

    underlay = document.getElementsByClassName('action-dot-rect');
    if(underlay[0] !== undefined){
      underlay[0].setAttribute('class', 'action-dot-rect-remove');
    }

    return toReturn;
  };

  actionButtons.createDropdown = function(buttons, tbe, changeText){
    var droppoint = document.getElementById('dropdown').childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');

    var group = svgb.createGroup('buttonGroup', 0, 0);
    var svgCircle = svgb.createCircle('action-dot-underlay', x, 40, 40);
    group.appendChild(svgCircle);
    //group.appendChild(svgRect);
    tbe.svg.appendChild(group);
    var animateSlideDown = {
      frame: 20,
      adx: 0,
      ady: (400)/20,
    };
    this.slideButton(animateSlideDown, group);
    var svgRect = svgb.createRect('action-dot-rect', x-40, 40, 80, 400);
    svgCircle = svgb.createCircle('action-dot-underlay', x, 40, 40);
    tbe.svg.appendChild(svgCircle);
    tbe.svg.appendChild(svgRect);
    this.addButton(changeText, x, y, tbe, 'pullUp', 'pullUp');
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);
    var newButtons = [];


    for(var i = 0; i < buttons.length; i++){
      var label = buttons[i].label;
      newButtons[i] = this.addButton(label, x, y, tbe, "loadDoc" + label);
    }

    for(var k = 0; k < newButtons.length; k++){
      animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: ((80 * (k+1)))/20,
      };
      this.slideButton(animateSlideDown, newButtons[k]);
    }

    return newButtons;
  };
  actionButtons.deleteDropdown = function(buttons, tbe, changeText){
    for(var i = 0; i < buttons.length; i++){
      var animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: -((80 * (i+1))/20)
      };
      this.slideButton(animateSlideDown, buttons[i], "delete");
    }
    var droppoint = document.getElementById('pullUp').childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');
    this.addButton(changeText, x, y, tbe, 'dropdown', 'dropdown');
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);
    var underlay = document.getElementsByClassName('action-dot-underlay');
    underlay[0].setAttribute('transform', 'translate (0 0)');
    var animateSlide = {
      frame: 20,
      adx: 0,
      ady: -(400)/20
    };
    this.slideButton(animateSlide, underlay[0], "delete");
    underlay[1].setAttribute('transform', 'translate (0 0)');
    animateSlide = {
      frame: 20,
      adx: 0,
      ady: 0
    };
    this.slideButton(animateSlide, underlay[1], "delete");

    underlay = document.getElementsByClassName('action-dot-rect');
    underlay[0].setAttribute('class', 'action-dot-rect-remove');
  };

  actionButtons.addButton = function(label, x, y, tbe, command, id){
    var group = svgb.createGroup('buttonGroup', 0, 0);
    var svgCircle = svgb.createCircle('action-dot', x, y, 33);
    var svgText = svgb.createText('action-dot-text', x, parseInt(y, 10)+13, label);
    if(command !== undefined){
      svgCircle.setAttribute('command', command);
    }
    if(id !== undefined){
      group.setAttribute('id', id);
    }
    group.appendChild(svgCircle);
    group.appendChild(svgText);
    tbe.svg.appendChild(group);
    return group;
  };

  actionButtons.slideButton = function slideButton(state, button, option){
    var frame = state.frame;
    var currentAttribute = button.getAttribute('transform');
    var parenPos = currentAttribute.lastIndexOf(')');
    var commaPos = currentAttribute.lastIndexOf(' ');
    var currentY = parseInt(currentAttribute.substring(commaPos, parenPos), 10);
    button.setAttribute('transform', 'translate(' + state.adx + ' ' + (currentY + state.ady) + ')');
    if (frame > 1) {
      state.frame = frame - 1;
      requestAnimationFrame(function() { slideButton(state, button, option); });
    } else if(option === "delete"){
      button.parentNode.removeChild(button);
    }
  };

  return actionButtons;

}();
