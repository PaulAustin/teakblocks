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
  var svgb = require('./../svgbuilder.js');
  var app = require('./../appMain.js');
  var dso = require('./deviceScanOverlay.js');

  // Map of all dots to map SVG dotIndex attribure to JS objects
  actionButtons.mapIndex = 0;
  actionButtons.dotMap = [];

  // Set of top dots after they have been defined.
  actionButtons.topDots = [];
  actionButtons.commandDots = [];

  // How many dots in each region.
  actionButtons.dotsLeft = 0;
  actionButtons.dotsMiddle = 0;
  actionButtons.dotsRight = 0;

  // Flag to prevent nested animations, seconds hits bounce off.
  actionButtons.isAnimating = false;
  actionButtons.currentSubShowing = null;

  // Construct an action dot object, the object manage the SVGs
  // used by the dot and related dropdown.
  actionButtons.ActionDot = function ActionButton (button) {
      // Connect the generic block class to the behavior definition class.

      actionButtons.dotMap[actionButtons.mapIndex] = this;
      this.dotIndex = actionButtons.mapIndex;
      actionButtons.mapIndex += 1;

      this.command = button.command;
      this.label = button.label;
      this.alignment = button.alignment;
      if (this.alignment === undefined) {
          this.alignment = 'S';
      }
      this.tweakx = button.tweakx;
      if (this.tweakx === undefined) {
          this.tweakx = 0;
      }

      this.svgDotGroup = null;
      this.svgSubGroup = null;
      this.sub = button.sub;
      this.subShowing = false;

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

      this.subDots = [];
      if (this.sub !== undefined) {
          for(var i = 0; i < this.sub.length; i++) {
              this.subDots.push(new actionButtons.ActionDot(this.sub[i]));
          }
      }
  };

  // sizeButtonsToWindow adjust al SVGs to match the screen sizePaletteToWindow
  actionButtons.sizeButtonsToWindow = function (w, h) {

      // System basically makes room for 10 dots.
      // some from right, some from left, some in the center.
      // Still a bit hard coded.
      var slotw = w * 0.1;
      var edgeSpacing = 7;
      var x = 0;
      var y = edgeSpacing;
      var dotd = 66;   // diameter
      var fontSize = 34;

      // Shrink if page is too short or too wide.
      // Need to add width check.

      if ( h < 500 ) {
          if ( h < 350) {
              h = 350;
          }
          var scale = (h / 500);
          dotd *=  scale;
          y *=  scale;
          fontSize *= scale;
      }

      var half = w / 2;
      var mid = half - ((actionButtons.dotsMiddle + 1) * (slotw / 2));

      // The action-dot class is used for event dispatching. The overall
      // group, but not the the interior items should have this class
      for (var i = 0; i < actionButtons.topDots.length; i++) {
        var pos = actionButtons.topDots[i].position;
        var align = actionButtons.topDots[i].alignment;
        // The action-dot class is used for event dispatching. The overall
        // group, but not the the interior items should have this class
        if (align === 'L') {
          x = (slotw * (pos)) + (edgeSpacing * 2);
        } else if(align === 'M') {
          x = mid + (slotw * (pos+1));
        } else if (align === 'R') {
          x = w - (slotw * pos);
        }
        actionButtons.topDots[i].updateSvg(x, y, dotd, fontSize);
      }
  };

// Create an image for the block base on its type.
actionButtons.ActionDot.prototype.updateSvg = function(x, y, dotd, fontSize) {
    // x and y are top left of dot bouding square
    // dotd is the diameter of the dots

    // Remove exisiting dot group if it exists
    if (this.svgDotGroup !== null) {
        if (this.svgSubGroup !== null && this.subShowing) {
            actionButtons.svgDotParent.removeChild(this.svgSubGroup);
            this.subShowing = false;
        }
        actionButtons.svgDotParent.removeChild(this.svgDotGroup);
    }
    // Disconnect reference to inner pieces so GC will clean them up.
    this.svgDotGroup = null;
    this.svgDot = null;
    this.svgText = null;
    this.svgText2 = null;
    this.dotDiameter = dotd;
    this.dopTop = y;

    var svgDG = svgb.createGroup('action-dot', 0, 0);
    var label = this.label;
    var dotHalf = dotd/2;
    var fontY = y + dotHalf + (fontSize / 3);

    //Check if character strings are more than one character to create a label on top of the usual label
  if (this.command === 'deviceScanOverlay') {
    // For the connect label put the device name
    this.svgDot = svgb.createRect('action-dot-bg', x-200, y, 180, dotd, dotHalf);
    this.svgText = svgb.createText('fa fas action-dot-fatext', x - 120, fontY, dso.decoratedName());
    this.svgText.setAttribute('id', 'device-name-label');
  } else if (this.label.length > 1) {
      // For files its the doc icon with letter inside. Only one text box has
      // font awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa fas action-dot-fatext', x + dotHalf, fontY, label.substring(0, 1));
    //???  svgText2 = svgb.createText('action-dot-doc-label', x + tweakx, buttonFH, label.substring(1));
    //???  group.appendChild(svgText2);
    } else {
      // For simple buttons ther is just one font-awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa fas action-dot-fatext', x + dotHalf + this.tweakx, fontY, label);
    }
    this.svgText.style.fontSize = fontSize.toString() + 'px';

    this.svgDot.setAttribute('id', 'action-dot-' + this.command);
    svgDG.appendChild(this.svgDot);
    svgDG.appendChild(this.svgText);
    svgDG.setAttribute('dotIndex', this.dotIndex);
    this.svgDotGroup = svgDG;

    if (this.sub !== undefined) {
        this.svgSubGroup = this.updateDropdownSvg(x, y, dotd, fontSize);
    }

    actionButtons.svgDotParent.appendChild(this.svgDotGroup);
  };

  // Open up the drop down menu
  // The SVG tree for the drop down is build and saved for use by the event
  // handlers
  actionButtons.ActionDot.prototype.updateDropdownSvg = function(x, y, dotd, fontSize) {

    var spacing = y; // Spacing from the top edge
    var svgSubGroup = svgb.createGroup('action-dot-dropdown', 0, 0);

    var ddWidth = dotd + (2 * spacing);
    // The background for the buttons will be a rounded rect a bit larger than
    // the dots, it wil animate to full length when shown.
    this.subBackBottom = ((this.subDots.length + 1) * (dotd + spacing)) + spacing;
    this.subBackD = ddWidth;
    this.svgSubBack = svgb.createRect('action-dot-dropdown-bg',
       x-spacing, y-spacing, ddWidth, ddWidth, ddWidth/2);

    svgSubGroup.appendChild(this.svgSubBack);

    // Insert the buttons that go on the drop-down
    var dotTop = y;
    for(var i = 0; i < this.subDots.length; i++) {
      // Move down from the dot above
      dotTop += dotd + spacing;
      var subDot = this.subDots[i];
      var svg = subDot.buildSubDot(x, dotTop, y, dotd, fontSize);
      svgSubGroup.appendChild(svg);
    }
    return svgSubGroup;
  };

  actionButtons.ActionDot.prototype.buildSubDot = function(x, dotTop, dotTopHide, dotd, fontSize) {
    this.x = x;
    this.dotTop = dotTop;           // where ethe dot shoudl be once shown.
    this.dotTopHide = dotTopHide;   // where the dot hide.

    var dothalf = dotd/2;
    var svgDG = svgb.createGroup('action-dot', 0, 0);
    var fontHeight = dotTop + dothalf + (fontSize / 3);
    this.svgDot = svgb.createCircle('action-dot-bg', x + dothalf, dotTop + dothalf, dothalf);
    this.svgText = svgb.createText('fa action-dot-fatext', x + dothalf, fontHeight, this.label);
    this.svgText.style.fontSize = fontSize.toString() + 'px';

    // ??? What is this ????
    if (this.command === 'copy') {
    //  vgDG.classList.add('copyButton');
    }

    this.svgDot.setAttribute('id', 'action-dot-' + this.command);
    svgDG.appendChild(this.svgDot);
    svgDG.appendChild(this.svgText);
    svgDG.setAttribute('dotIndex', this.dotIndex);
    this.svgDotGroup = svgDG;
    return svgDG;
  };

  actionButtons.ActionDot.prototype.activate = function(state) {
      // 0 - Back to normal
      // 1 - Highlight mouse-down/finger-press)
      // 2 - Do it, valid release.
      // 3 - Highlight state with overlay showing.
      if (state === 1) {
          this.svgDot.classList.add('action-dot-active');
      } else if (state === 0 || state === 2) {
          this.svgDot.classList.remove('overlay-showing');
          this.svgDot.classList.remove('action-dot-active');
          if (state === 0 && this.subShowing) {
              this.animateDropDown();
          }
      } else if (state === 3) {
        this.svgDot.classList.add('overlay-showing');
      }
  };

  actionButtons.ActionDot.prototype.doCommand = function() {
      this.activate(2);
      if (this.sub === undefined) {
          var cmd = this.command;
          actionButtons.reset();
          app.doCommand(cmd);
      } else if (app.overlays.currentShowing === null) {
          this.animateDropDown();
      }
  };

  actionButtons.ActionDot.prototype.animateDropDown = function() {
      if (actionButtons.isAnimating)
        return;
      actionButtons.isAnimating = true;
      if (!this.subShowing) {
          if (this.sub !== undefined) {
              if ( actionButtons.currentSubShowing !== null) {
                  // Hide other menu if one is up. In this case
                  // its OK to do both animations at the same time.
                  actionButtons.currentSubShowing.subShowing = false;
                  actionButtons.currentSubShowing.slideDots({ frame: 0, frameEnd: 10 }, false);
                  actionButtons.currentSubShowing = null;
              }
              // Insert the drop down beneath the dot/
              actionButtons.svgDotParent.insertBefore(this.svgSubGroup, this.svgDotGroup);
              actionButtons.currentSubShowing = this;
              this.slideDots( { frame: 0, frameEnd: 10 }, true);
          }
          this.subShowing = true;
      } else {
          // Start all the animations that hide buttons.
          this.subShowing = false;
          this.slideDots({ frame: 0, frameEnd: 10 }, false);
          actionButtons.currentSubShowing = null;
        }
  };

  // A target location is set for the last dot, each dot will move relative
  // to the position it is in, the background will adjust as well.
  actionButtons.ActionDot.prototype.slideDots = function(state, down) {
      var thisDot = this;

      // Based on frame calculate a 0.0 to 1.0 fraction
      var f = state.frame / state.frameEnd;
      if (!down) {
           f = 1.0 - f;
      }

      // Animate the drop down back ground.
      var h = (this.subBackBottom - this.subBackD) * f;
      this.svgSubBack.setAttribute('height', String(this.subBackD + h) + 'px');

      // Animate the dots.
      var numDots = this.subDots.length;
      for(var i = 0; i < numDots; i++) {
          var subDot = this.subDots[i];
          var span = subDot.dotTop - subDot.dotTopHide;
          var dy = -((1.0 - f) * span);
          subDot.svgDotGroup.setAttribute('transform', 'translate(0 ' + dy + ')');
      }
      state.frame += 1;
      if (state.frame <= state.frameEnd) {
          requestAnimationFrame(function() { thisDot.slideDots(state, down); });
      } else {
          actionButtons.isAnimating = false;
          if (!down) {
              actionButtons.svgDotParent.removeChild(this.svgSubGroup);
          }
      }
  };

  actionButtons.reset = function() {
    for (var i = 0; i < actionButtons.topDots.length; i++) {
        actionButtons.topDots[i].activate(0);
    }
  };

  actionButtons.activate = function(name, state) {
      var dot = actionButtons.commandDots[name];
      console.log('ac', name, state, dot);
      if ( dot !== undefined ) {
        dot.activate(state);
      }
  };

  actionButtons.defineButtons = function(buttons, svg) {

    actionButtons.svgDotParent = svg;
    // Menu elements will be added at the end, that measn they will
    // be visually in the front. All editor elements will be behind this
    // element.
    var base = svgb.createGroup('action-dot', 0, 0);
    svg.appendChild(base);

    var i = 0;
    for (i = 0; i < buttons.length; i++) {
      var dot = new this.ActionDot(buttons[i]);
      actionButtons.topDots.push(dot);
      actionButtons.commandDots[dot.command] = dot;
    }

    // SVG items with the 'action-dot' class will process these events.
    interact('.action-dot', {context:svg})
    .draggable({})
    .on('down', function (event) {
      // Highligth on initial interaction
      var dotIndex = event.currentTarget.getAttribute('dotIndex');
      actionButtons.dotMap[dotIndex].activate(1);
    })
    .on('hold', function () {
      // show some help.
    })
    .on('dragmove', function (event) {
//        console.log('cancel', event);
      // show some help.
    })
    .on('enter', function (event) {
      // show some help.
//      console.log('enter', event);
    })
    .on('tap', function (event) {
      // Do command if event is in button
      var dotIndex = event.currentTarget.getAttribute('dotIndex');
      actionButtons.dotMap[dotIndex].doCommand();
  });
    return base;
  };

  return actionButtons;
}();
