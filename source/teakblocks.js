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

var assert = require('assert');
var interact = require('interact.js');
var teak = require('teak');
var teakForm = require('./teak-forms.js');
var teakText = require('./teaktext.js');
var svgb = require('./svgbuilder.js');
var svglog = require('./svglog.js');

var tbe = {};

tbe.diagramBlocks = [];
tbe.paletteBlocks = [];

tbe.clearStates = function clearStates() {
  // clear any showing forms or multi step state.
  // If the user has interacted with a general part of the editor.
  teakForm.hideOpenForm();
};

tbe.init = function init(svg, text) {
  this.svg = svg;
  this.teakCode = text;
  this.configFBInteract();
//  this.configTabInteract();
  interact.maxInteractions(Infinity);
  return this;
};

tbe.elementToBlock = function(el) {
    var text = el.getAttribute('interact-id');

    if (text === null)
      return null;
    var values = text.split(':');
    if (values[0] === 'd') {
      return this.diagramBlocks[values[1]];
    } else if (values[0] === 'p') {
      return this.paletteBlocks[values[1]];
    } else {
      return null;
    }
};

tbe.addBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = false;
   block.interactId = 'd:' + this.diagramBlocks.length;
   this.diagramBlocks.push(block);
};

tbe.addPaletteBlock = function(x, y, name, params) {
   var block = new this.FunctionBlock(x, y, name);
   block.params = params;
   block.isPaletteBlock = true;
   block.interactId = 'p:' + this.paletteBlocks.length;
   this.paletteBlocks.push(block);
};

tbe.popPaletteItem = function(block){
  var index = this.paletteBlocks.indexOf(block);
  if (index !== -1) {
      // The new palette block has the same location, name, and id.
      var npb = new this.FunctionBlock(block.rect.left, block.rect.top, block.name);
      npb.params = JSON.parse(JSON.stringify(block.params));
      npb.isPaletteBlock = true;
      npb.interactId = block.interactId;
      this.paletteBlocks[index] = npb;
  }
  // Now change the block to a diagramBlock.
  block.isPaletteBlock = false;
  block.interactId = 'd:' + this.diagramBlocks.length;
  this.diagramBlocks.push(block);
};

// Constructor for FunctionBlock object.
tbe.FunctionBlock = function FunctionBlock (x, y, blockName) {
  // Make a JS object that wraps the SVG object
  this.rect  = {
      left:   0,
      top:    0,
      right:  80,
      bottom: 80,
  };

  this.name = blockName;

  // Place holder for sequencing links.
  this.prev = null;
  this.next = null;

  // Dragging state information.
  this.dragging = false;
  this.coasting = 0;
  this.snapTarget = null;   // Object to append, prepend, replace
  this.snapAction = null;   // append, prepend, replace, ...
  this.targetShadow = null; // Svg element to hilite target location

  var group = svgb.createGroup('drag-group', 0, 0);
  // Create the actual SVG object. Its a group of two pieces
  // a rounded rect and a text box. The group is moved by changing
  // it's transform (see dmove)

  var rect = svgb.createRect('function-block', 0, 0, 1);
  // For safari 8/14/2016 rx or ry must be explicitly set other wise rx/ry
  // values in css will be ignored. Perhasp a more optimized rect is used.

  var text = svgb.createText('function-text', 10, 45, blockName);

  group.appendChild(rect);
  group.appendChild(text);
  // group.appendChild(createBranchPath());

  this.svgGroup = group;
  this.svgRect= rect;
  this.dmove(x, y, true);
  tbe.svg.appendChild(group);
};

Object.defineProperty(tbe.FunctionBlock.prototype, 'first', {
  get: function() {
    var block = this;
    while (block.prev !== null)  {
      block = block.prev;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'last', {
  get: function() {
    var block = this;
    while (block.next !== null)  {
      block = block.next;
    }
    return block;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'chainWidth', {
  get: function() {
    var block = this;
    var width = 0;
    while (block !== null)  {
      width  += block.rect.right - block.rect.left;
      block = block.next;
    }
    return width;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'blockWidth', {
  get: function() {
    return this.rect.right - this.rect.left;
  }});

Object.defineProperty(tbe.FunctionBlock.prototype, 'blockHeight', {
  get: function() {
    return this.rect.bottom - this.rect.top;
  }});

// Example of an object property added with defineProperty with an accessor property descriptor
Object.defineProperty(tbe.FunctionBlock.prototype, 'interactId', {
  get: function() {
    return this.svgRect.getAttribute('interact-id');
  },
  set: function(id) {
    this.svgGroup.setAttribute('interact-id', id);
    this.svgRect.setAttribute('interact-id', id);
  },
});

// Mark all block in the chain starting with 'this' block as being dragged.
// Disconnect from the previous part of the chain.
tbe.FunctionBlock.prototype.setDraggingState = function (state) {
  // If this block is in a chain, disconnect it from blocks in front.
  if (state && (this.prev !== null)) {
    this.prev.next = null;
    this.prev = null;
  }
  // Set the state of all blocks down the chain.
  var block = this;
  while (block !== null) {
    block.dragging = state;
    block.hilite(state);
    block = block.next;
  }
};

// Change the element class to trigger CSS changes.
tbe.FunctionBlock.prototype.hilite = function(state) {
  if (state) {
    // Bring hilited block to top. Blocks don't normally
    // overlap, so z plane is not important. But blocks
    // that are being dragged need to float above one on
    // the diagram.
    tbe.svg.appendChild(this.svgGroup);
    this.svgRect.setAttribute('class', 'function-block-dragging');
  } else {
    this.svgRect.setAttribute('class', 'function-block');
  }
};

// Move a section of a chain a delta x, y (from this to endBlock)
tbe.FunctionBlock.prototype.dmove = function (dx, dy, snapToInt, endBlock) {
  var block = this;
  if (endBlock === undefined) {
   endBlock = null;
  }

  while (block !== null) {
    var r = block.rect;
    r.left += dx;
    r.top += dy;
    r.right += dx;
    r.bottom += dy;
    if (snapToInt) {
      // Final locations are forced to integers for clean serialization.
      r.top = Math.round(r.top);
      r.left = Math.round(r.left);
      r.bottom = Math.round(r.bottom);
      r.right = Math.round(r.right);
    }
    block.svgGroup.setAttribute ('transform', 'translate (' +  r.left + ' ' + r.top + ')');

    if (block === endBlock) {
      break;
    }
    block = block.next;
  }
};

// Calculate the intersecting area of two rectangles.
tbe.intersectingArea = function intersectingArea(r1, r2) {
    var x = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
    if (x < 0 )
      return 0;
    var y = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
    if (y < 0) {
      return 0;
    }
    return x * y;
};

tbe.FunctionBlock.prototype.hilitePossibleTarget = function() {
  var self = this;
  var target = null;
  var overlap = 0;
  var bestOverlap = 0;
  var bestRect = null;
  var action = null;
  var rect = null;
  var thisWidth = this.blockWidth;

  // look at every diagram block taking into consideration
  // weather or not it is in  chain.

  // For insert it could snap after the previous block or before the next block
  // which make the most sense?
  tbe.diagramBlocks.forEach(function(entry) {
    if (entry !== self  && !entry.dragging) {
      rect = {
        top:    entry.rect.top,
        bottom: entry.rect.bottom,
        left:   entry.rect.left - (thisWidth * 0.5),
        right:  entry.rect.right - (thisWidth * 0.5),
      };
      if (entry.prev === null) {
        // For left edge, increase gravity field
        rect.left -= thisWidth * 0.5;
      }
      if (entry.next === null) {
        // For right edge, increase gravity field
        rect.right += thisWidth * 1.5;
      }

      overlap = tbe.intersectingArea(self.rect, rect);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestRect = rect;
        target = entry;
      }
    }
  });

  // Refine the action based on geometery.
  if (target !== null) {
    if (self.rect.left < (target.rect.left)) {
      if (target.prev !== null) {
        action = 'insert';
      } else {
        action = 'prepend';
      }
    } else {
      action = 'append';
    }
    if (tbe.components.configSettings.editorXRay()) {
      svglog.logRect(tbe.svg, bestRect, action + ' ' + target.name);
    }
  }

  // Update shadows as needed.
  if (this.snapTarget !== target || this.snapAction !== action) {
    if (this.snapTarget !== null) {
      this.removeTargetShadows();
    }
    this.snapTarget = target;
    this.snapAction = action;
    if (target !== null) {
      this.insertTargetShadows(target, action);
    }
  }
  return target;
};

// Show the shadow blocks to indicate where the blocks will end up if placed
// in the current location.
tbe.FunctionBlock.prototype.insertTargetShadows = function(target, action) {
  var block = this;
  var x = 0;
  var y = target.rect.top;
  if (action === 'prepend') {
    x = target.rect.left - this.chainWidth;
  } else if (action === 'insert') {
    // The shadows will be covered up, and not going to move the
    // down stream blocks until the move is committed.
    // so offset them a bit.
    // TODO show abovw OR based on wherr draggin block are coming from.
    x = target.rect.left - 15;
    y -= 15;
  } else if (action === 'append') {
    x = target.rect.right;
  } else {
    return;
  }
  var shadow = null;
  while (block !== null) {
    shadow = svgb.createRect('shadow-block', x, y, 1);
    tbe.svg.insertBefore(shadow, tbe.svg.firstChild);
    block.targetShadow = shadow;
    x += block.blockWidth;
    block = block.next;
  }
};

tbe.FunctionBlock.prototype.removeTargetShadows = function() {
  var block = this;
  var shadowsToRemove = [];
  while (block !== null) {
    var shadow = block.targetShadow;
    if (shadow !== null) {
      shadowsToRemove.push(shadow);
      shadow.setAttribute('class', 'shadow-block-leave');
      block.targetShadow = null;
    }
    block = block.next;
  }
  // Give some time for the animation to complete, then remove.
  setTimeout(function() {
    shadowsToRemove.forEach( function(elt) {
      tbe.svg.removeChild(elt);
      });
    },
    1000);
};

tbe.FunctionBlock.prototype.moveToPossibleTarget = function() {
  var thisLast = this.last;
  var frameCount = 10;
  var targx = 0;

  assert(this.prev === null);
  assert(thisLast.next === null);

  if (this.snapTarget !==  null && this.targetShadow !== null) {
    // TODO:assert that chain we have has clean prev/next links
    // Append/Prepend the block(chain) to the list
    if(this.snapAction === 'prepend') {
      assert(this.snapTarget.prev === null);
      targx =  this.snapTarget.rect.left - this.chainWidth;
      thisLast.next = this.snapTarget;
      this.snapTarget.prev = thisLast;
    } else if (this.snapAction === 'append') {
      assert(this.snapTarget.next === null);
      targx =  this.snapTarget.rect.right;
      this.prev = this.snapTarget;
      this.snapTarget.next = this;
      // slide down post blocks if insert
      // logically here, in annimation bellow
    } else if (this.snapAction === 'insert') {
      assert(this.snapTarget.prev !== null);
      targx =  this.snapTarget.rect.left;
      // Determin space needed for new segment
      // before its spliced in.
      var width = this.chainWidth;

      thisLast.next = this.snapTarget;
      this.prev = this.snapTarget.prev;
      this.snapTarget.prev.next = this;
      this.snapTarget.prev = thisLast;

      // Set up animation to slide down old blocks.
      this.snapTarget.animateState = {
        adx: width / frameCount,
        ady: 0,
        frame: frameCount,
      };
      tbe.easeToTarget(0, this.snapTarget, this.snapTarget.last);
    } // TODO: replace???

    // Set up an animation to move the dragging blocks to new location.
    var dx = targx - this.rect.left;
    var dy = this.snapTarget.rect.top - this.rect.top;

      // TODO:base frame count on distance to final location.
      // The model snaps directly to the target location
      // but the view eases to it.
    this.animateState = {
      adx: dx / frameCount,
      ady: dy / frameCount,
      frame: frameCount,
    };
    tbe.easeToTarget(0, this, thisLast);
  } else {
    // Nothing to snap to so leave it where is ended up.
    // still need sound though
    // tbe.audio.drop.play();
  }
  this.hilite(false);
  this.snapTarget = null;
  this.snapAction = null;
};

tbe.easeToTarget = function easeToTarget(timeStamp, block, endBlock) {
  var frame = block.animateState.frame;
  block.dmove(block.animateState.adx, block.animateState.ady, (frame === 1), endBlock);
  if (frame > 1) {
    block.animateState.frame = frame - 1;
    requestAnimationFrame(function(timestamp) { easeToTarget(timestamp, block, endBlock); });
  } else {
    // Once animation is over shadows are covered, remove them.
    tbe.audio.playSound(tbe.audio.shortClick);
    block.removeTargetShadows();
  }
};

tbe.clearDiagramBlocks = function clearDiagramBlocks() {
  tbe.diagramBlocks.forEach(function(block) {
    tbe.svg.removeChild(block.svgGroup);
    block.svgGroup = null;
    block.svgRect = null;
    block.next = null;
    block.prev = null;
  });
  tbe.diagramBlocks.length = 0;
  tbe.diagramChanged();
};

// Attach these interactions properties based on the class property of the DOM elements
tbe.configFBInteract = function configFBInteract() {
  var thisTbe = tbe;
  interact('.drag-group')
    .on('down', function (event) {
      tbe.clearStates();
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      block.coasting = 0;
    })
    .on('up', function (event) {
      // Mark the chain as coastin. if it finds a target
      // it will snap to it.
      var block = thisTbe.elementToBlock(event.target);
      if (block === null)
        return;
      block.coasting = 1;
    })
    // .on('hold', function(event) {
    //   var block = thisTbe.elementToBlock(event.target);
    // TODO press and hold...
    // })
    .draggable({
      restrict: {
          restriction: thisTbe.svg,
          endOnly: true,
          // Restrictions, by default, are for the point not the whole object
          // so R and B are 1.x to inlcude the width and height of the object.
          // 'Coordinates' are percent of width and height.
          elementRect: { left: -0.2, top: -0.2, right: 1.2, bottom: 1.2 },
        },
      inertia: {
        resistance: 20,
        minSpeed: 50,
        endSpeed: 1
      },
      max: Infinity,
      onstart: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

      if (block.isPaletteBlock) {
        // Turn the palette block into a diagram block.
        thisTbe.popPaletteItem(block);
      }
      block.setDraggingState(true);
      },
      onend: function(event) {
        var block = thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.coasting > 0) {
          block.coasting = 0;
          block.moveToPossibleTarget();
          block.setDraggingState(false);
        }

        svglog.clearLog();
        // Serialize after all moving has settled.
        // TODO clean this up, canoverlap next transaction
        setTimeout(thisTbe.diagramChanged(), 500);
      },
      onmove: function (event) {
        // Since there is inertia these callbacks continue to
        // happen after the user lets go. If a target is found
        // in the coasting state, start the animation to the target.
        // dont wait to coas to a stop.
        var block =  thisTbe.elementToBlock(event.target);
        if (block === null)
          return;

        if (block.dragging) {
          block.dmove(event.dx, event.dy, true);
        }

        if (block.coasting >= 0) {
          var target = block.hilitePossibleTarget();
          // If target found while coasting, then snap to it.
          // other wise just show the shadows.
          if ((target !== null) &&
              (block.coasting > 0)) {
            block.coasting = -1; // ignore further coasting.
            block.moveToPossibleTarget();
            block.setDraggingState(false);
          }
        }
      }
    });
    /*
    .resizable({
      autoScroll: {
        container: tbe.svg,
        margin: 50,
        distance: 5,
        interval: 10
      }
    });
    */
};

tbe.diagramChanged = function diagramChanged() {
  this.teakCode.value = teakText.blocksToText(tbe.diagramBlocks);
};

/*
tbe.configTabInteract = function configTabInteract() {
  var thisTbe = tbe;
  interact('.tab-block')
    .on('down', function (event) {
      var tab = thisTbe.tabs[event.target];
    });
};
*/

tbe.buildSvgTabs = function buildSvgTabs() {

};

tbe.sizePaletteToWindow = function sizePaletteToWindow () {
  var w = window.outerWidth;
  var h = window.innerHeight;

  tbe.dropAreaGroup.setAttribute ('transform', 'translate (' +  0 + ' ' + (h - 100) + ')');
  tbe.dropArea.style.width = w;

  tbe.windowRect = {left:0, top:0, right:w, bottom:h };
  var top = h - 90;

  tbe.paletteBlocks.forEach(function(block) {
    block.dmove(0, top - block.rect.top, true);
  });
};

tbe.initPalettes =  function initPalettes(palettes) {

  document.body.onresize = tbe.sizePaletteToWindow;
  tbe.blockObject = palettes;

  tbe.dropAreaGroup = svgb.createGroup("",0, 0);
  tbe.dropArea = svgb.createRect('dropArea', 0, 0, 0);
  tbe.dropAreaGroup.appendChild(tbe.dropArea);

  tbe.tabs = [];
  for (var tabIndex = 0; tabIndex < tbe.blockObject.tabs.length; tabIndex++){
  //  var newtab = svgb.createSymbolUse('tab-block', '#palette-tab');
  //  newtab.x = 200; //('x', 200);
  //  newtab.y = 20 + (100 * a); // ('y', 20 + (100 * a));
  //  tbe.svg.appendChild(newtab);

    var tab = svgb.createGroup("",0, 0);
    var tabblock = svgb.createRect('tab-block', 0, 0, 0);
    var tabName = tbe.blockObject.tabs[tabIndex];
    var text = svgb.createText('tab-text', 10, 20, tabName);

    tab.appendChild(tabblock);
    tab.appendChild(text);

    var letpath = '';
    switch (tabIndex) {
      case 0:
        letpath = 'A';
        break;
      case 1:
        letpath = 'B';
        break;
      case 2:
        letpath = 'C';
        break;
      case 3:
        letpath = 'D';
        break;
      case 4:
        letpath = 'E';
        break;
    }

    tab.setAttribute('transform', 'translate(20, ' + (5 + (30 * tabIndex)) + ')');
    tab.setAttribute('letter', letpath);

    tab.addEventListener('click', function() {
      tbe.clearStates();
      var path = null;
      switch(this.getAttribute('letter')) {
          case 'A':
            path = tbe.blockObject.A;
            break;
          case 'B':
            path = tbe.blockObject.B;
            break;
          case 'C':
            path = tbe.blockObject.C;
            break;
          case 'D':
            path = tbe.blockObject.D;
            break;
          case 'E':
            path = tbe.blockObject.E;
            break;
        }

      for(var i = 0; i < tbe.blockObject.A.length; i++){
        //find letter inside tag
        // move the palettes to the front.
        // TODO Just move palettes, no need to make new ones.
        tbe.addPaletteBlock(80 + (90 * i), tbe.windowRect.bottom - 90,  path[i],{ });
      }
    });
    tbe.dropAreaGroup.appendChild(tab);
  }
  tbe.svg.appendChild(tbe.dropAreaGroup);

  for(var i = 0; i < tbe.blockObject.A.length; i++){
    tbe.addPaletteBlock(80 + (90 * i), 0, tbe.blockObject.A[i], {port:'a','power':50,'time':'2.5s'});
  }

  tbe.sizePaletteToWindow();
};

return tbe;
}();
