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
  var actionButtons = {};
  var svgb = require('./svgbuilder.js');
  var dso = require('./overlays/deviceScanOverlay.js');

  actionButtons.cancelActionButtons = function(buttonDefs) {
      for(var i = 0; i < buttonDefs.length; i++) {
        if (buttonDefs.svgCircle.classList.contains('action-dot-active')) {
          buttonDefs[i].svgCircle.classList.remove('action-dot-active');
        }
      }
  };

  actionButtons.activate = function(target) {
      // The event target will be the top level SVG group.
      target.classList.toggle('action-dot-active');
  };

  actionButtons.addActionButtons = function(buttons, tbe) {
    var position = null;
    var alignment = null;
    var command = '';
    var tweakx = 0;
    var label = '';
    var numMiddle = 0;

    var group = null;
    var svgButtonBase = null;
    var svgText = null;
    var svgText2 = null;
    var existing = document.getElementsByClassName('buttonGroup');
    var dropLength = document.getElementsByClassName('dropdown-buttons').length;

    var buttonR = 33;
    var buttonFH = 53;
    if (tbe.height < 300) {
        buttonR = 20;
        buttonFH = 30;
    } else if (tbe.height < 450) {
        buttonR = 25;
        buttonFH = 40;
    }
    console.log('AAB:', dso.height, buttonR);

    // If action buttons exist, delete them.
    if(existing[0] !== undefined){
      while(existing.length > 0){
          existing[0].parentNode.removeChild(existing[0]);
      }
    }

    // Determine how many buttons are in the middle.
    for (var k = 0; k < buttons.length; k++) {
      if (buttons[k].alignment === 'M' && buttons[k].position > numMiddle) {
        numMiddle = buttons[k].position;
      }
    }

    var half = tbe.width/2;
    var middleLeft = half - ((numMiddle + 1) * 0.05 * tbe.width);
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
        x = ((0.1 * tbe.width) * position);
      } else if(alignment === 'M') {
        x = middleLeft + ((0.1 * tbe.width) * position);
      } else if (alignment === 'R') {
        x = tbe.width - ((0.1 * tbe.width) * position);
      }

      // The action-dot class is used for event dispatching. The overall
      // group, but not the the interior items should have this class
      group = svgb.createGroup('action-dot', 0, 0);

      //Check if character strings are more than one character to create a label on top of the usual label
      if (command === 'connect') {
        // For the connect label put the device name
        svgButtonBase = svgb.createRect('action-dot-bg', x - 20, 8, 180, buttonR * 2, buttonR);
        label = "bot: " + dso.deviceName;
        svgText = svgb.createText('action-dot-text', x + 60, buttonFH, label);
        svgText.setAttribute('id', 'device-name-label');
        group.appendChild(svgButtonBase);
        group.appendChild(svgText);
      } else if (label.length > 1) {
        // For files its the doc icon with letter inside. Only one text box has
        // font awesome icon.
        svgButtonBase = svgb.createCircle('action-dot-bg', x, 40, buttonR);
        svgText = svgb.createText('fa action-dot-text', x + tweakx, buttonFH, label.substring(0, 1));
        svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, buttonFH, label.substring(1));
        group.appendChild(svgButtonBase);
        group.appendChild(svgText);
        group.appendChild(svgText2);
      } else {
        // For simple buttons ther is just one font-awesome icon.
        svgButtonBase = svgb.createCircle('action-dot-bg', x, 40, buttonR);
        svgText = svgb.createText('fa action-dot-text', x + tweakx, buttonFH, label);
        group.appendChild(svgButtonBase);
        group.appendChild(svgText);
      }

      tbe.svg.appendChild(group);
      buttons[i].svgText = svgText;
      buttons[i].svgCircle = svgButtonBase;
      group.setAttribute('command', command);
      group.setAttribute('id', buttons[i].command + 'Command');
    }

    var underlay = document.getElementsByClassName('action-dot-dropdown');
    if(underlay[0] !== undefined){
      if(underlay[0].getAttribute('transform') === null){
        underlay[0].setAttribute('transform', 'translate (0 0)');
      }
      var animateSlide = {
        frame: 20,
        adx: 0,
        ady: -(dropLength*80)/20
      };
      this.slideButton(animateSlide, underlay[0], "delete");
      if(underlay[1].getAttribute('transform') === null){
        underlay[1].setAttribute('transform', 'translate (0 0)');
      }
      animateSlide = {
        frame: 20,
        adx: 0,
        ady: 0
      };
      this.slideButton(animateSlide, underlay[1], "delete");
    }

/*
    underlay = document.getElementsByClassName('action-dot-rect-pages');
    if(underlay[0] !== undefined){
      underlay[0].setAttribute('class', 'action-dot-rect-remove-pages');
    }
    underlay = document.getElementsByClassName('action-dot-rect-edit');
    if(underlay[0] !== undefined){
      underlay[0].setAttribute('class', 'action-dot-rect-remove-edit');
    }
    */
  };

  actionButtons.createDropdown = function(buttons, tbe, changeText, id) {
    // Find out where the drop down will be positioned.
    // The is the center of the button
    var droppoint = document.getElementById(id + 'Command').childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');

    var group = svgb.createGroup('action-dot-dropdown', 0, 0);
    var svgCircle = svgb.createRect('action-dot-rect-pages', x - 40, 0, 80, (buttons.length  + 1) * 80, 40);
    group.appendChild(svgCircle);

    // Add the dropdown behind the main button.
    tbe.svg.insertBefore(group, droppoint[0].parentNode);
    //droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);

    // Insert the buttons that go one the drop-down
    var newButtons = [];
    for(var i = 0; i < buttons.length; i++){
      var label = buttons[i].label;
      // This test is a bit wonky.
      if(label.match(/[a-z]/i) !== null){
        newButtons[i] = this.addButton(label, x, y, tbe, buttons[i].command, undefined, 'dropdown-buttons', 'text-buttons');
      } else {
        newButtons[i] = this.addButton(label, x, y, tbe, buttons[i].command, undefined, 'dropdown-buttons');
      }
    }

    // Start all the animations that moce them into place.
    var animateSlideDown = null;
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

  actionButtons.deleteDropdown = function(buttons, tbe, changeText, id){
    for(var i = 0; i < buttons.length; i++){
      var animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: -((80 * (i+1))/20)
      };
      this.slideButton(animateSlideDown, buttons[i], "delete");
    }
    // Find the bottom circle
    var droppoint = document.getElementById('pullUp' + id).childNodes;
    var x = droppoint[0].getAttribute('cx');
    var y = droppoint[0].getAttribute('cy');
    this.addButton(changeText, x, y, tbe, id, id);
    // REmove it
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);

    // Find the recangle
    var underlay = document.getElementsByClassName('action-dot-dropdown');
    var animateSlide = {
      frame: 20,
      adx: 0,
      ady: -(buttons.length*80)/20
    };

    this.slideButton(animateSlide, underlay[0], "delete");
    animateSlide = {
      frame: 20,
      adx: 0,
      ady: 0
    };
    this.slideButton(animateSlide, underlay[1], "delete");

    // Get rid of it.
    underlay = document.getElementsByClassName('action-dot-rect' + id);
    underlay[0].setAttribute('class', 'action-dot-rect-remove' + id);
  };

  actionButtons.addButton = function(label, x, y, tbe, command, id, eltClass){
    var group = svgb.createGroup('action-dot', 0, 0);
    var svgCircle = svgb.createCircle('action-dot-bg', x, y, 33);
    var svgText = svgb.createText('fa action-dot-text', x, parseInt(y, 10)+13, label);
    if(command !== undefined){
      group.setAttribute('command', command);
    }

    if(id !== undefined){
      group.setAttribute('id', id);
    }
    if(eltClass !== undefined){
      group.setAttribute('class', 'buttonGroup ' + eltClass);
      if (command === 'copy') {
        var curr = group.getAttribute('class');
        group.setAttribute('class', curr + ' copy-button');
      }
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
    var spacePos = currentAttribute.lastIndexOf(' ');
    var currentY = parseInt(currentAttribute.substring(spacePos, parenPos), 10);
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
