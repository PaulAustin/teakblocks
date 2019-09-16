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
  var actionDots = {};
  var interact = require('interact.js');
  var svgb = require('svgbuilder.js');
  var editStyle = require('editStyle.js');
  var app = require('./../appMain.js');
  var fastr = require('fastr.js');
  var dso = require('./deviceScanOverlay.js');

  // Map of all dots to map SVG dotIndex attribure to JS objects
  actionDots.mapIndex = 0;
  actionDots.dotMap = [];

  // Set of top dots after they have been defined.
  actionDots.topDots = [];
  actionDots.commandDots = [];

  // How many dots in each region.
  actionDots.dotsLeft = 0;
  actionDots.dotsMiddle = 0;
  actionDots.dotsRight = 0;

  // Flag to prevent nested animations, seconds hits bounce off.
  actionDots.isAnimating = false;
  actionDots.currentSubShowing = null;
  actionDots.docTitleSVG = null;

  // Construct an action dot object, the object manage the SVGs
  // used by the dot and related dropdown.
  actionDots.ActionDot = function ActionButton (button) {
    // Connect the generic block class to the behavior definition class.
    actionDots.dotMap[actionDots.mapIndex] = this;
    this.dotIndex = actionDots.mapIndex;
    actionDots.mapIndex += 1;

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

    this.svgDot = null;
    this.svgDotGroup = null;
    this.svgSubGroup = null;
    this.sub = button.sub;
    this.subShowing = false;

    if (button.alignment === 'L') {
      this.position = actionDots.dotsLeft;
      actionDots.dotsLeft += 1;
    } else if (button.alignment === 'M') {
      this.position = actionDots.dotsMiddle;
      actionDots.dotsMiddle += 1;
    } else if (button.alignment === 'R') {
      this.position = actionDots.dotsRight;
      actionDots.dotsRight += 1;
    }

    this.subDots = [];
    if (this.sub !== undefined) {
      for(var i = 0; i < this.sub.length; i++) {
        this.subDots.push(new actionDots.ActionDot(this.sub[i]));
      }
    }
  };

  // resize adjust al SVGs to match the screen sizePaletteToWindow
  actionDots.resize = function (w, h) {

    // System basically makes room for 10 dots.
    // some from right, some from left, some in the center.
    // Still a bit hard coded.
    var slotw = w * 0.1;
    var edgeSpacing = 7;
    var x = 0;
    var dotd = 66;   // diameter

    // Shrink if page is too short or too wide.
    // Need to add width check.
    var scale = editStyle.calcSreenScale(w, h);
    var y = edgeSpacing * scale;
    var half = (w / 2) - (dotd / 2);
    var mid = half - ((actionDots.dotsMiddle + 1) * (slotw / 2));

    // The action-dot class is used for event dispatching. The overall
    // group, but not the the interior items should have this class
    for (var i = 0; i < actionDots.topDots.length; i++) {
      var pos = actionDots.topDots[i].position;
      var align = actionDots.topDots[i].alignment;
      // The action-dot class is used for event dispatching. The overall
      // group, but not the the interior items should have this class
      if (align === 'L') {
        x = (slotw * (pos)) + (edgeSpacing * 2);
      } else if(align === 'M') {
        x = mid + (slotw * (pos+1));
      } else if (align === 'R') {
        x = w - (slotw * pos);
      }
      actionDots.topDots[i].updateSvg(x, y, scale);
    }
  };

  actionDots.setDocTitle = function(newName) {
    if (actionDots.docTitleSVG !== null) {
      actionDots.docTitleSVG.textContent = newName;
    }
  };

  // Create an image for the block base on its type.
  actionDots.ActionDot.prototype.updateSvg = function(x, y, scale) {
    // x and y are top left
    // scale allos for small window (or devics)
    var dotd = 66 * scale;        // dot diameter
    var fontSize = 34 * scale;

    // Remove exisiting dot group if it exists
    if (this.svgDotGroup !== null) {
      if (this.svgSubGroup !== null && this.subShowing) {
        actionDots.svgDotParent.removeChild(this.svgSubGroup);
        this.subShowing = false;
      }
      actionDots.svgDotParent.removeChild(this.svgDotGroup);
    }
    // Disconnect reference to inner pieces so GC will clean them up.
    this.svgDotGroup = null;
    this.svgDot = null;
    this.svgText = null;
    this.svgTextOverlay = null;
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
      var buttonWidth = (170 * scale);
      var buttonLeft = x - buttonWidth - 20;
      var buttonCenter = buttonLeft + (80 * scale);
      this.svgDot = svgb.createRect('action-dot-bg', buttonLeft, y, buttonWidth, dotd, dotHalf);
      this.svgText = svgb.createText('fa fas action-dot-fatext', buttonCenter, fontY, dso.decoratedName());
      this.svgText.setAttribute('id', 'device-name-label');
    } else if (this.label === fastr.file) {
      // For files its the doc icon with letter inside.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa fas action-dot-fatext', x + dotHalf, fontY, label.substring(0, 1));
      this.svgTextOverlay = svgb.createText('action-dot-doc-label', x + dotHalf, fontY, 'A');
      actionDots.docTitleSVG = this.svgTextOverlay;
    } else {
      // For simple buttons ther is just one font-awesome icon.
      this.svgDot = svgb.createCircle('action-dot-bg', x + dotHalf, y + dotHalf, dotHalf);
      this.svgText = svgb.createText('fa action-dot-fatext fas', x + dotHalf + this.tweakx, fontY, label);
    }
    editStyle.setFontSize(this.svgText.style, fontSize);

    this.svgDot.setAttribute('id', 'action-dot-' + this.command);
    svgDG.appendChild(this.svgDot);
    svgDG.appendChild(this.svgText);
    if (this.svgTextOverlay !== null) {
      svgDG.appendChild(this.svgTextOverlay);
    }
    svgDG.setAttribute('dotIndex', this.dotIndex);
    this.svgDotGroup = svgDG;

    if (this.sub !== undefined) {
      this.svgSubGroup = this.updateDropdownSvg(x, y, dotd, fontSize);
    }

    actionDots.svgDotParent.appendChild(this.svgDotGroup);
  };

  // Open up the drop down menu
  // The SVG tree for the drop down is build and saved for use by the event
  // handlers
  actionDots.ActionDot.prototype.updateDropdownSvg = function(x, y, dotd, fontSize) {

    var spacing = y; // Spacing from the top edge
    var svgSubGroup = svgb.createGroup('action-dot-dropdown', 0, 0);

    var ddWidth = dotd + (2 * spacing);
    // The background for the buttons will be a rounded rect a bit larger than
    // the dots, it wil animate to full length when shown.
    this.subBackBottom = ((this.subDots.length + 1) * (dotd + spacing)) + spacing;
    this.subBackD = ddWidth;
    this.svgSubBack = svgb.createRect('action-dot-dropdown-bg', x-spacing, y-spacing,
      ddWidth, ddWidth, ddWidth/2);

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

  actionDots.ActionDot.prototype.buildSubDot = function(x, dotTop, dotTopHide, dotd, fontSize) {
    this.x = x;
    this.dotTop = dotTop;           // where ethe dot shoudl be once shown.
    this.dotTopHide = dotTopHide;   // where the dot hide.

    var dothalf = dotd/2;
    var svgDG = svgb.createGroup('action-dot', 0, 0);
    var fontHeight = dotTop + dothalf + (fontSize / 3);
    this.svgDot = svgb.createCircle('action-dot-bg', x + dothalf, dotTop + dothalf, dothalf);
    this.svgText = svgb.createText('fa action-dot-fatext', x + dothalf, fontHeight, this.label);
    editStyle.setFontSize(this.svgText.style, fontSize);

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

  actionDots.ActionDot.prototype.activate = function(state) {
    // 0 - Back to normal
    // 1 - Highlight mouse-down/finger-press)
    // 2 - Do it, valid release.
    // 3 - Highlight state with overlay showing.
    // This is way to much of a hack. TODO refactor
    if (this.svgDot === null) {
      return; // Button not setup yet.
    } else if (state === 1) {
      this.svgDot.classList.add('action-dot-active');
    } else if (state === 0 || state === 2) {
      this.svgDot.classList.remove('running');
      this.svgDot.classList.remove('overlay-showing');
      this.svgDot.classList.remove('action-dot-active');
      this.svgText.classList.remove('running');
      if (state === 0 && this.subShowing) {
        this.animateDropDown();
      }
    } else if (state === 3) {
      this.svgDot.classList.add('overlay-showing');
    } else if (state === 5) {
      this.svgDot.classList.add('running');
      this.svgText.classList.add('running');
    }
  };

  actionDots.hideOverlay = function() {
    if (app.overlays.currentShowing !== null) {
      actionDots.activate(app.overlays.currentShowing, 0);
      app.overlays.hideOverlay(null);
    }
  };

  actionDots.ActionDot.prototype.doCommand = function() {
    // Highlight the button hit
    this.activate(2);
    if (this.sub === undefined) {
      // No sub menu, just clear state and do the command even if
      // an overlay is up. This allows run and stop to be pressed
      // while an overlay is up.
      var cmd = this.command;
      actionDots.reset();
      app.doCommand(cmd);
    } else {
      // If it's a pull down the hide any showing overlay first.
      actionDots.hideOverlay();
      this.animateDropDown();
    }
  };

  actionDots.ActionDot.prototype.animateDropDown = function() {
    if (actionDots.isAnimating)
      return;
    actionDots.isAnimating = true;
    if (!this.subShowing) {
      if (this.sub !== undefined) {
        if ( actionDots.currentSubShowing !== null) {
          // Hide other menu if one is up. In this case
          // its OK to do both animations at the same time.
          actionDots.currentSubShowing.subShowing = false;
          actionDots.currentSubShowing.slideDots({ frame: 0, frameEnd: 10 }, false);
          actionDots.currentSubShowing = null;
        }
        // Insert the drop down beneath the dot/
        actionDots.svgDotParent.insertBefore(this.svgSubGroup, this.svgDotGroup);
        actionDots.currentSubShowing = this;
        this.slideDots( { frame: 0, frameEnd: 10 }, true);
      }
      this.subShowing = true;
    } else {
      // Start all the animations that hide buttons.
      this.subShowing = false;
      this.slideDots({ frame: 0, frameEnd: 10 }, false);
      actionDots.currentSubShowing = null;
    }
  };

  // A target location is set for the last dot, each dot will move relative
  // to the position it is in, the background will adjust as well.
  actionDots.ActionDot.prototype.slideDots = function(state, down) {
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
      actionDots.isAnimating = false;
      if (!down) {
        actionDots.svgDotParent.removeChild(this.svgSubGroup);
      }
    }
  };

  actionDots.reset = function() {
    // Skip the play button since it takes care of its self.
    // TODO refactor, this is over kill, main need is to reset when overlay
    // is hidden.
    for (var i = 1; i < actionDots.topDots.length; i++) {
      actionDots.topDots[i].activate(0);
    }
  };

  actionDots.activate = function(name, state) {
    var dot = actionDots.commandDots[name];
    if ( dot !== undefined ) {
      dot.activate(state);
    }
  };

  actionDots.doPointerEvent = function(event) {
    var elt = document.elementFromPoint(event.clientX, event.clientY);
    var t = event.type;
    var adi = actionDots.activeIndex;
    if (elt !== null) {
      var par = elt.parentNode;
      var cdi = par.getAttribute('dotIndex');
      if (t === 'dragend' || t === 'tap') {
        if (cdi === actionDots.activeIndex) {
          // If it is a tap the the release right same location as press.
          actionDots.dotMap[adi].doCommand();
        } else {
          actionDots.dotMap[adi].activate(0);
        }
        actionDots.activeIndex = -1;
      } else if (t === 'dragmove') {
        // Deactivate/Activate when leaving/reentering
        actionDots.dotMap[adi].activate(cdi === adi ? 1 : 0);
      }
    }
  };

  actionDots.defineButtons = function(buttons, svg) {
    actionDots.activeIndex = -1;
    actionDots.svgDotParent = svg;
    // Menu elements will be added at the end, that measn they will
    // be visually in the front. All editor elements will be behind this
    // element.
    var base = svgb.createGroup('action-dot', 0, 0);
    svg.appendChild(base);

    var i = 0;
    for (i = 0; i < buttons.length; i++) {
      var dot = new this.ActionDot(buttons[i]);
      actionDots.topDots.push(dot);
      actionDots.commandDots[dot.command] = dot;
    }

    // Pretty sure there may be an easier way to do this. But in may way interact.js
    // If it simple down and up wiht no move then is come through as a tap.
    // If the pointer/finger moves it is a drag. The drag is better than the move
    // events, since it will return events even once the pointer has moved
    // outside the element.
    // SVG items with the 'action-dot' class will process these events.
    interact('.action-dot', {context:svg})
    .draggable({})
    .on('down', function (event) {
      var dotIndex = event.currentTarget.getAttribute('dotIndex');
      actionDots.activeIndex = dotIndex;
      actionDots.dotMap[dotIndex].activate(1);
    })
    .on('dragmove', function (event) {
      actionDots.doPointerEvent(event);
    })
    .on('dragend', function (event) {
      actionDots.doPointerEvent(event);
    })
    .on('tap', function (event) {
      actionDots.doPointerEvent(event);
    });
    return base;
  };

  return actionDots;
}();
