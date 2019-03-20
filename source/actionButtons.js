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
  var actionButtons = {};
  var interact = require('interact.js');
  var svgb = require('./svgbuilder.js');
  var dso = require('./overlays/deviceScanOverlay.js');
  var app = require('./appMain.js');

  actionButtons.dots = [];
  actionButtons.dotsLeft = 0;
  actionButtons.dotsMiddle = 0;
  actionButtons.dotsRight = 0;

  actionButtons.sizeButtonsToWindow = function (tbe) {

      console.log( "Adjust for screen size - rebuild/reposition SVGs");

      var w = tbe.width;
      var h = tbe.height;
      var half = w / 2;
      var middleLeft = half - ((actionButtons.dotsMiddle + 1) * 0.05 * w);

      var buttonRadius = 30;
      if ( h < 500 ) {
          buttonRadius = 20;
      }

      // The action-dot class is used for event dispatching. The overall
      // group, but not the the interior items should have this class
      var i = 0;
      for ( i = actionButtons.dots.length - 1; i >= 0; i--) {
          actionButtons.dots[i].updateSvg();
          /*
        position = buttons[i].position;
        alignment = buttons[i].alignment;

        if (alignment === 'L') {
          x = ((0.1 * tbe.width) * position);
        } else if(alignment === 'M') {
          x = middleLeft + ((0.1 * tbe.width) * position);
        } else if (alignment === 'R') {
          x = tbe.width - ((0.1 * tbe.width) * position);
        }
        */
      }
      return;

      /*
      var w = tbe.width;
      var h = tbe.height;
      var half = tbe.width/2;
      var middleLeft = half - ((numMiddle + 1) * 0.05 * tbe.width);
      var alignment = '';
      var x = 0;
      var position = 0;
      var dots = tbe.actionButtons;
      var tweakx = 0;
      var command = "";
      var label = "";

      for (var key in tbe.actionButtons) {
        if (tbe.actionButtons.hasOwnProperty(key)) {
          var dot = tbe.actionButtons[key];
          if (typeof block === 'object') {

              position = dot.position;
              alignment = dot.alignment;
              command = dot.command;
              tweakx = dot.tweakx;
              if (tweakx === undefined) {
                tweakx = 0;
              }
              label = dot.label;

          }
        }
      }
*/

  };

  actionButtons.ActionDot = function ActionButton (button) {
      // Connect the generic block class to the behavior definition class.
      this.command = button.command;
      this.label = button.label;

      console.log("constructing cmd-", button)
      if (button.alignment === 'M') {
          actionButtons.dotsMiddle += 1;
      } else if (button.alignment === 'L') {
          actionButtons.dotsLeft += 1;
      } else if (button.alignment === 'R') {
          actionButtons.dotsRight += 1;
      }

      this.svgDotGroup = null;
  };

// Create an image for the block base on its type.
actionButtons.ActionDot.prototype.updateSvg = function() {

    console.log(" regenerating the SVG - ", this.command);

    // Empty the shell if it exists.
    if (this.svgDotGroup !== null) {
      this.svgDotParent.removeChild(this.svgDotGroup);
    }
    this.svgDotGroup = null;
    // disconnect reference to inner pieces so GC will clean them up.
    this.svgDot = null;
    this.svgText = null;
    this.svgText2 = null;

    // The action-dot class is used for event dispatching. The overall
    // group, but not the the interior items should have this class
    var svgDG = svgb.createGroup('action-dot', 0, 0);
    var label = "";
    var buttonR = 19;
    var buttonFH = 12;
    var x = 40;
    var tweakx = 0;

    //Check if character strings are more than one character to create a label on top of the usual label
    if (this.command === 'connect') {
      // For the connect label put the device name
      this.svgDot = svgb.createRect('action-dot-bg', x - 20, 8, 180, buttonR * 2, buttonR);
      label = "bot: " + dso.deviceName;
      this.svgText = svgb.createText('action-dot-text', x + 60, buttonFH, label);
      this.svgText.setAttribute('id', 'device-name-label');
      svgDG.appendChild(this.svgDot);
      svgDG.appendChild(this.svgText);
  } else if (this.label.length > 1) {
      // For files its the doc icon with letter inside. Only one text box has
      // font awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x, 40, buttonR);
      this.svgText = svgb.createText('fa action-dot-text', x + tweakx, buttonFH, label.substring(0, 1));
    //???  svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, buttonFH, label.substring(1));
    //???  group.appendChild(svgText2);
    } else {
      // For simple buttons ther is just one font-awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x, 40, buttonR);
      this.svgText = svgb.createText('fa action-dot-text', x + tweakx, buttonFH, label);
    }
    svgDG.appendChild(this.svgDot);
    svgDG.appendChild(this.svgText);

    this.svgDotGroup = svgDG;
    actionButtons.svgDotParent.appendChild(this.svgDotGroup);

    //??? group.setAttribute('command', command);
    //??? group.setAttribute('id', buttons[i].command + 'Command');


/*
    var group = svgb.createGroup('action-dot', 0, 0);

    tbe.svg.appendChild(group);
    buttons[i].svgText = svgText;
    buttons[i].svgCircle = svgButtonBase;
    group.setAttribute('command', command);
    group.setAttribute('id', buttons[i].command + 'Command');
*/

  };


  actionButtons.reset = function(buttonDefs) {
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

  actionButtons.defineButtons = function(buttons, tbe) {

    console.log( "Define the buttons !!!!!!!");

    actionButtons.svgDotParent = tbe.svg;
    var i = 0;

    for (i = buttons.length - 1; i >= 0; i--) {
      actionButtons.dots.push(new this.ActionDot(buttons[i]));
    }

    // SVG items with the 'action-dot' class will process These
    // events.
    interact('.action-dot')
    .on('down', function (event) {
      actionButtons.activate(event.currentTarget);
    })
    .on('up', function (event) {
      actionButtons.activate(event.currentTarget);
      var cmd = event.currentTarget.getAttribute('command');
      console.log('on up doing command', cmd);
      // ?? perhaps redirect this, dont call app. directly
      app.doCommand(cmd);
    });

    console.log( "defined buffons SVG", actionButtons.dotsLeft, actionButtons.dotsMiddle,
actionButtons.dotsRight );
};

  // Open up the drop down menu
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

    // Start all the animations that move buttons into place.
    var animateSlideDown = null;
    for(var k = 0; k < newButtons.length; k++){
      animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: ((80 * (k+1)))/20
      };
      this.slideButton(animateSlideDown, newButtons[k]);
    }
    return newButtons;
  };

  // Hide up the drop down menu, reverse the animation, hide the element.
  actionButtons.deleteDropdown = function(buttons, tbe, changeText, id) {
    console.log('hide dropdown', id);
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
