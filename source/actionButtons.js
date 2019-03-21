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
  // How many dots in each region.
  actionButtons.dotsLeft = 0;
  actionButtons.dotsMiddle = 0;
  actionButtons.dotsRight = 0;

  // Construct an action dot object, the object manage the SVGs
  // used by the dot and related dropdown.
  actionButtons.ActionDot = function ActionButton (button, index) {
      // Connect the generic block class to the behavior definition class.
      this.command = button.command;
      this.label = button.label;
      this.alignment = button.alignment;
      this.dotIndex = index;
      this.sub = button.sub;

      if (button.alignment === 'L') {
          this.position = actionButtons.dotsLeft;
          actionButtons.dotsLeft += 1;
      } else if (button.alignment === 'M') {
          this.position = actionButtons.dotsMiddle;
          actionButtons.dotsMiddle += 1;
      } else if (button.alignment === 'R') {
          this.position = actionButtons.dotsRight;
          actionButtons.dotsRight += 1;
      }

      this.svgDotGroup = null;
  };

  // sizeButtonsToWindow adjust al SVGs to mathc the screen sizePaletteToWindow
  actionButtons.sizeButtonsToWindow = function (w, h) {

      // System basically makes room for 10 dots.
      // some from right, some from left, some in the center.
      // Still a bit hard coded.
      var slotw = w * 0.1;
      var edgeSpacing = 10;
      var x = 0;
      var y = edgeSpacing;
      var dotd = 60;   // diameter
      // Shrink if page is too short or too wide.
      // Need to add width check.
      if ( h < 500 ) {
          if ( h < 350) {
              h = 350;
          }
          var scale = (h / 500);
          dotd *=  scale;
          y *=  scale;
      }

      var half = w / 2;
      var mid = half - ((actionButtons.dotsMiddle + 1) * (slotw / 2));

      // The action-dot class is used for event dispatching. The overall
      // group, but not the the interior items should have this class
      var i = 0;
      for ( i = actionButtons.dots.length - 1; i >= 0; i--) {
        var pos = actionButtons.dots[i].position;
        var align = actionButtons.dots[i].alignment;
        // The action-dot class is used for event dispatching. The overall
        // group, but not the the interior items should have this class
        if (align === 'L') {
          x = (slotw * (pos)) + (edgeSpacing * 2);
        } else if(align === 'M') {
          x = mid + (slotw * (pos+1));
        } else if (align === 'R') {
          x = w - (slotw * pos);
        }
        actionButtons.dots[i].updateSvg(x, y, dotd);
      }
  };

// Create an image for the block base on its type.
actionButtons.ActionDot.prototype.updateSvg = function(x, y, dotd) {
    // x and y are top left of dot bouding square
    // dotd is the diameter of the dots

    // Remove exisiting dot group if it exists
    if (this.svgDotGroup !== null) {
      actionButtons.svgDotParent.removeChild(this.svgDotGroup);
    }
    this.svgDotGroup = null;
    // disconnect reference to inner pieces so GC will clean them up.
    this.svgDot = null;
    this.svgText = null;
    this.svgText2 = null;

    var svgDG = svgb.createGroup('action-dot', 0, 0);
    var label = this.label;
    var dotHalf = dotd/2;
    var fontY = y + dotHalf + 13;

    //Check if character strings are more than one character to create a label on top of the usual label
    if (this.command === 'connect') {
      // For the connect label put the device name
      this.svgDot = svgb.createRect('action-dot-bg', x-200, y, 180, dotd, dotHalf);
      label = "bot: " + dso.deviceName;
      this.svgText = svgb.createText('action-dot-text', x - 100, fontY, label);
      this.svgText.setAttribute('id', 'device-name-label');
  } else if (this.label.length > 1) {
      // For files its the doc icon with letter inside. Only one text box has
      // font awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa action-dot-text', x + dotHalf, fontY, label.substring(0, 1));
    //???  svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, buttonFH, label.substring(1));
    //???  group.appendChild(svgText2);
    } else {
      // For simple buttons ther is just one font-awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa action-dot-text', x + dotHalf, fontY, label);
    }

    svgDG.appendChild(this.svgDot);
    svgDG.appendChild(this.svgText);
    svgDG.setAttribute('dotIndex', this.dotIndex);
    this.svgDotGroup = svgDG;
    actionButtons.svgDotParent.appendChild(this.svgDotGroup);

    // If there is a sub menu then build it for later use. Its not
    // inserted in the DOM till needed.
    if (this.sub !== undefined) {
        this.svgSubGroup = this.updateDropdownSvg(x, y, dotd, this.sub);
        // Add the dropdown to the dot group but before the dot itself.
        svgDG.insertBefore(this.svgSubGroup, this.svgDot);
    }
  };

  // Open up the drop down menu
  // The SVG tree for the drop down is build and saved for use by the event
  // handlers
  actionButtons.ActionDot.prototype.updateDropdownSvg = function(x, y, dotd, sub) {

    var spacing = y; // Spacing from the top edge
    var svgSubGroup = svgb.createGroup('action-dot-dropdown', 0, 0);

    var ddWidth = dotd + (2 * spacing);
    // The background for the buttons will be a rounded rect a bit larger than
    // the dots, it wil animate to full length when shown.
    var ddHeight = ((sub.length + 1) * (dotd + spacing)) + spacing;
    var svgCircle = svgb.createRect('action-dot-rect-pages',
       x-spacing, y-spacing, ddWidth, ddHeight, ddWidth/2);

    svgSubGroup.appendChild(svgCircle);

    // Insert the buttons that go on the drop-down
    for(var i = 0; i < sub.length; i++) {

      // Move down from the dot above
      y += dotd + spacing;
      var label = sub[i].label;
      var subDot = null;

      if(label.match(/[a-z]/i) !== null){
        subDot = this.buildSubDot(x, y, dotd, label, sub[i].command, 'dropdown-buttons', 'text-buttons');
      } else {
        subDot = this.buildSubDot(x, y, dotd, label, sub[i].command, 'dropdown-buttons');
      }
      svgSubGroup.appendChild(subDot);
    }
    return svgSubGroup;
  };

  actionButtons.ActionDot.prototype.buildSubDot = function(x, y, dotd, label, command, id, eltClass) {
    var dothalf = dotd/2;
    var group = svgb.createGroup('action-dot', 0, 0);
    var fontHeight = y + dothalf + 13; //??? whats with the 13?
    var svgCircle = svgb.createCircle('action-dot-bg', x + dothalf, y + dothalf, dothalf);
    var svgText = svgb.createText('fa action-dot-text', x + dothalf, fontHeight, label);

    group.setAttribute('id', id);

    // ??? What is this ????
    if(eltClass !== undefined){
      group.setAttribute('class', 'buttonGroup ' + eltClass);
      if (command === 'copy') {
        var curr = group.getAttribute('class');
        group.setAttribute('class', curr + ' copy-button');
      }
    }
    group.appendChild(svgCircle);
    group.appendChild(svgText);
    if(command !== undefined){
      group.setAttribute('command', command);
    }
    return group;
  };

  actionButtons.ActionDot.prototype.activate = function() {
      this.svgDot.classList.toggle('action-dot-active');
  };

  actionButtons.ActionDot.prototype.doCommand = function() {
      this.svgDot.classList.toggle('action-dot-active');
      var cmd = this.command;
      app.doCommand(cmd);
  };

  actionButtons.reset = function() {
      for (var i = actionButtons.dots.length - 1; i >= 0; i--) {
          //    if (buttonDefs.svgCircle.classList.contains('action-dot-active')) {
          actionButtons.dots[i].svgDot.classList.remove('action-dot-active');
      }
  };

  actionButtons.defineButtons = function(buttons, tbe) {

    actionButtons.svgDotParent = tbe.svg;

    var i = 0;
    for (i = 0; i < buttons.length; i++) {
      actionButtons.dots.push(new this.ActionDot(buttons[i], i));
    }

    // SVG items with the 'action-dot' class will process These
    // events.
    interact('.action-dot')
    .on('down', function (event) {
      var dotIndex = event.currentTarget.getAttribute('dotIndex');
      actionButtons.dots[dotIndex].activate(event.currentTarget);
    })
    .on('up', function (event) {
      var dotIndex = event.currentTarget.getAttribute('dotIndex');
      actionButtons.dots[dotIndex].doCommand(event.currentTarget);
    });

};

actionButtons.ActionDot.prototype.animateDropDown = function(x, y, dotd, sub) {
    // Start all the animations that move buttons into place.
    /*
    var animateSlideDown = null;
    for(var k = 0; k < newButtons.length; k++) {
      animateSlideDown = {
        frame: 20,
        adx: 0,
        ady: ((80 * (k+1)))/20
      };
      this.slideButton(animateSlideDown, newButtons[k]);
    }
    */
};

  // Hide up the drop down menu, reverse the animation, hide the element.
  actionButtons.deleteDropdown = function(buttons, tbe, changeText, id) {
    console.log('hide dropdown', id);
    for(var i = 0; i < buttons.length; i++) {
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
    this.addButton(changeText, x, y, id, id);  //???yuck
    // Remove it
    droppoint[0].parentNode.parentNode.removeChild(droppoint[0].parentNode);

    // Find the rectangle
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

  actionButtons.slideButton = function slideButton(state, button, option) {
    var frame = state.frame;
    var currentAttribute = button.getAttribute('transform');
    var parenPos = currentAttribute.lastIndexOf(')');
    var spacePos = currentAttribute.lastIndexOf(' ');
    var currentY = parseInt(currentAttribute.substring(spacePos, parenPos), 10);
    button.setAttribute('transform', 'translate(' + state.adx + ' ' + (currentY + state.ady) + ')');
    if (frame > 1) {
      state.frame = frame - 1;
      requestAnimationFrame(function() { slideButton(state, button, option); });
  } else {
      actionButtons.animating = false;
      if(option === "delete"){
       button.parentNode.removeChild(button);
      }
    }
  };

  return actionButtons;
}();
